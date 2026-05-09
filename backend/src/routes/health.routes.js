const express = require("express");

const { getSystemHealth } = require("../services/health.service");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const health = await getSystemHealth();

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