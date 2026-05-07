const express = require('express');
const logger = require("../utils/logger");
const {sendMessage} = require('../services/producer.service');
const {generateTraffic} = require('../services/traffic.service');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { runStages } = require('../services/execution.engine');
const { getMetrics } = require('../metrics/metrics.store');
const Run = require('../modules/run/run.model');
const { v4: uuidv4 } = require('uuid');
const { getControl, initControl } = require('../control/control.store');
const { getIO } = require('../websocket/socket');


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

  // Start execution in background
  runStages({ ...config, projectId, url, runId }).then(async () => {
    // After completion, update run with metrics
    const metrics = await getMetrics(projectId, runId);
    const finalControl = await getControl(projectId, runId);
    const finalStatus =
      finalControl.status === 'stopped' ? 'stopped' : 'completed';

    await Run.findOneAndUpdate({ projectId, runId }, {
      status: finalStatus,
      totalRequests: metrics.totalRequests,
      success: metrics.success,
      failure: metrics.failure,
      avgLatency: metrics.avgLatency,
      p95Latency: metrics.p95Latency,
      rps: metrics.rps,
      errorTypes: metrics.errorTypes,
      latencyBuckets: metrics.latencyBuckets,
      failureTimeline: metrics.failureTimeline,
    });
    getIO().emit(`complete-${projectId}-${runId}`);
  }).catch(async (err) => {
    logger.error('Error in runStages', err);
    await Run.findOneAndUpdate({ projectId, runId }, { status: 'failed' }).catch((error) => {
      logger.error({
        message: 'Failed to mark run as failed',
        runId,
        error: error.message,
      });
    });
    getIO().emit(`complete-${projectId}-${runId}`);
  });

  res.json({ runId, message: 'Test started' });
});

module.exports = router;
