const express = require("express");
const logger = require("../utils/logger");
const { sendMessage } = require("../services/producer.service");
const { generateTraffic } = require("../services/traffic.service");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const Run = require("../modules/run/run.model");
const { markRunComplete } = require("../metrics/metrics.store");
const { trackSimulation } = require("../modules/usage/usage.service");
const { v4: uuidv4 } = require("uuid");
const { initControl } = require("../control/control.store");
const enforcePlan = require("../middleware/plan.middleware");
const { verifyProjectOwnership } = require("../middleware/ownership.middleware");
const { getIO } = require("../websocket/socket");
const {
  validateConfig,
} = require("../modules/testConfig/testConfig.validator");
const {
  addIncident,
  getIncidentTimeline,
} = require("../services/incidentTimeline");
const router = express.Router();

const validateSimulationRequest = (req, res, next) => {
  const { url, config } = req.body;

  if (!url || !config) {
    return res.status(400).json({ error: "url and config required" });
  }

  try {
    req.normalizedUrl = new URL(url).toString();
    req.normalizedConfig = validateConfig(config);
    next();
  } catch (err) {
    return res.status(400).json({
      error: err.message || "Invalid simulation config",
    });
  }
};

router.get("/traffic", authMiddleware, async (req, res) => {
  const count = req.query.count || 10;

  const requestId = req.requestId;

  logger.info({ requestId, message: `Generating ${count} requests` });

  await generateTraffic(count, requestId);

  res.send(`Generated ${count} requests ✅`);
});

router.get("/send", async (req, res) => {
  await sendMessage();
  res.send("Message sent to Kafka ✅");
});

router.get("/admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.send("Welcome Admin! This is a protected route.");
});

router.post(
  "/test/:projectId",
  authMiddleware,
  verifyProjectOwnership,
  validateSimulationRequest,
  enforcePlan,
  async (req, res) => {
    const { projectId } = req.params;
    const normalizedUrl = req.normalizedUrl;
    const normalizedConfig = req.normalizedConfig;

    const runId = uuidv4();
    await initControl(projectId, runId);

    // Create run entry
    const run = new Run({
      runId,
      projectId,
      owner: req.user.id,
      config: normalizedConfig,
      url: normalizedUrl,
      status: "starting",
      createdAt: new Date(),
    });
    await run.save();

    await trackSimulation({
      userId: req.user.id,
      config: normalizedConfig,
    });

    addIncident({
      type: "simulation",
      severity: "info",
      title: "Simulation Started",
      message: `Run ${runId} started.`,
      metadata: {
        projectId,
        runId,
        pattern: normalizedConfig.pattern || "stages",
      },
    });

    getIO().emit("incident-timeline", getIncidentTimeline());

    // Start execution in background through the traffic service.
    // With USE_KAFKA=true, requests are published to Kafka and split across workers.
    generateTraffic(normalizedConfig, projectId, normalizedUrl, {
      runId,
      controlInitialized: true,
      owner: req.user.id,
    })
      .then(async () => {
        getIO().emit("incident-timeline", getIncidentTimeline());
        getIO().emit(`complete-${projectId}-${runId}`);
      })
      .catch(async (err) => {
        logger.error("Error in generateTraffic", err);
        await Run.findOneAndUpdate(
          { projectId, runId },
          { status: "failed" },
        ).catch((error) => {
          logger.error({
            message: "Failed to mark run as failed",
            runId,
            error: error.message,
          });
        });

        markRunComplete(runId);

        addIncident({
          type: "simulation",
          severity: "critical",
          title: "Simulation Failed",
          message: `Run ${runId} failed.`,
          metadata: {
            projectId,
            runId,
            error: err.message,
          },
        });

        getIO().emit("incident-timeline", getIncidentTimeline());
        getIO().emit(`complete-${projectId}-${runId}`);
      });

    res.json({ runId, status: "starting", message: "Test queued" });
  },
);

module.exports = router;
