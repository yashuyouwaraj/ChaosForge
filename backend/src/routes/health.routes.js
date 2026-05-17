const express = require("express");

const { getSystemHealth } = require("../services/health.service");
const { wakeGrafanaInBackground } = require("../services/grafana-readiness.service");
const {
  wakeConfiguredWorkersInBackground,
} = require("../services/worker-readiness.service");
const { getIOIfReady } = require("../websocket/socket");
const { getIncidentTimeline } = require("../services/incidentTimeline");


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const health = await getSystemHealth();
    const incidentTimeline = getIncidentTimeline();
    const io = getIOIfReady();

    if (io) {
      io.emit("infrastructure-alerts", health.alerts || []);
      io.emit("ai-insights", health.insights || []);
      io.emit(
        "incident-timeline",
        incidentTimeline,
      );
    }

    res.json({
      ...health,
      incidentTimeline,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to get system health",
      error: err.message,
    });
  }
});

router.post("/wake", (req, res) => {
  const workersWakeStarted = wakeConfiguredWorkersInBackground();

  wakeGrafanaInBackground();

  res.json({
    status: "wake_started",
    grafanaWakeStarted: true,
    workersWakeStarted,
  });
});

module.exports = router;
