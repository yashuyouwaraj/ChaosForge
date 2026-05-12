const express = require("express");

const { getSystemHealth } = require("../services/health.service");
const { getIOIfReady } = require("../websocket/socket");

const { getIncidentTimeline } = require("./services/incidentTimeline");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const health = await getSystemHealth();
    const io = getIOIfReady();

    if (io) {
      io.emit("infrastructure-alerts", health.alerts || []);
      io.emit(
        "incident-timeline",getIncidentTimeline(),
      );
    }

    res.json(health);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to get system health",
      error: err.message,
    });
  }
});

module.exports = router;
