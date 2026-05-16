const express = require('express');
const logger = require("../utils/logger");
const {sendMessage} = require('../services/producer.service');
const {generateTraffic} = require('../services/traffic.service');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const Run = require('../modules/run/run.model');
const { markRunComplete } = require('../metrics/metrics.store');
const { v4: uuidv4 } = require('uuid');
const { initControl } = require('../control/control.store');
const { getIO } = require('../websocket/socket');
const {
  addIncident,
  getIncidentTimeline,
} = require('../services/incidentTimeline');
const {
  ensureKafkaWorkersReady,
} = require('../services/worker-readiness.service');


const router = express.Router();

router.get('/traffic',authMiddleware,async(req,res)=>{
    const count = req.query.count || 10;

    const requestId = req.requestId ;

    logger.info({requestId, message:`Generating ${count} requests`})
    
    await generateTraffic(count, requestId);

    res.send(`Generated ${count} requests ✅`)
})

router.get('/send',async(req,res)=>{
    await sendMessage();
    res.send("Message sent to Kafka ✅")
})

router.get("/admin",authMiddleware,roleMiddleware("admin"),(req,res)=>{
    res.send("Welcome Admin! This is a protected route.")
})

router.post('/test/:projectId', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const { url, config } = req.body;

  if (!url || !config) {
    return res.status(400).json({ error: 'url and config required' });
  }

  const workerReadiness = await ensureKafkaWorkersReady();

  if (!workerReadiness.ready) {
    logger.warn({
      message: 'Simulation blocked because Kafka workers are not ready',
      projectId,
      reason: workerReadiness.reason,
      connectedWorkers: workerReadiness.connectedWorkers,
    });

    return res.status(503).json({
      error: 'Workers are still waking up. Please retry in a few seconds.',
      code: 'WORKERS_NOT_READY',
      connectedWorkers: workerReadiness.connectedWorkers,
    });
  }

  const runId = uuidv4();
  await initControl(projectId, runId);

  // Create run entry
  const run = new Run({
    runId,
    projectId,
    owner: req.user.id,
    config,
    url,
    status: 'running',
    createdAt: new Date(),
  });
  await run.save();

  addIncident({
    type: 'simulation',
    severity: 'info',
    title: 'Simulation Started',
    message: `Run ${runId} started.`,
    metadata: {
      projectId,
      runId,
      pattern: config.pattern || 'stages',
    },
  });

  getIO().emit('incident-timeline', getIncidentTimeline());

  // Start execution in background through the traffic service.
  // With USE_KAFKA=true, requests are published to Kafka and split across workers.
  generateTraffic(config, projectId, url, {
    runId,
    controlInitialized: true,
    owner: req.user.id,
  }).then(async () => {
    getIO().emit('incident-timeline', getIncidentTimeline());
    getIO().emit(`complete-${projectId}-${runId}`);
  }).catch(async (err) => {
    logger.error('Error in generateTraffic', err);
    await Run.findOneAndUpdate({ projectId, runId }, { status: 'failed' }).catch((error) => {
      logger.error({
        message: 'Failed to mark run as failed',
        runId,
        error: error.message,
      });
    });

    markRunComplete(runId);

    addIncident({
      type: 'simulation',
      severity: 'critical',
      title: 'Simulation Failed',
      message: `Run ${runId} failed.`,
      metadata: {
        projectId,
        runId,
        error: err.message,
      },
    });

    getIO().emit('incident-timeline', getIncidentTimeline());
    getIO().emit(`complete-${projectId}-${runId}`);
  });

  res.json({ runId, message: 'Test started' });
});

module.exports = router;
