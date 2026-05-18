const express = require("express");

const { getSystemHealth } = require("../services/health.service");
const {
  wakeGrafanaInBackground,
} = require("../services/grafana-readiness.service");
const {
  wakePrometheusInBackground,
} = require("../services/prometheus-readiness.service");
const { getIOIfReady } = require("../websocket/socket");
const { getIncidentTimeline } = require("../services/incidentTimeline");
const { PLATFORM_EVENTS } = require("../websocket/events");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const health = await getSystemHealth();
    const incidentTimeline = getIncidentTimeline();
    const io = getIOIfReady();

    if (io) {
      io.emit(PLATFORM_EVENTS.INFRASTRUCTURE_ALERTS, health.alerts || []);
      io.emit(PLATFORM_EVENTS.AI_INSIGHTS, health.insights || []);
      io.emit(PLATFORM_EVENTS.INCIDENT_TIMELINE, incidentTimeline);
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

router.post("/wake", async (req, res) => {
  try {
    wakeGrafanaInBackground();
    wakePrometheusInBackground();

    res.json({
      status: "wake_started",
      grafanaWakeStarted: true,
      prometheusWakeStarted: true,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to wake infrastructure",
      error: err.message,
    });
  }
});

module.exports = router;
