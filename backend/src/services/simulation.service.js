const { recordRequest, getMetrics } = require("../metrics/metrics.store");
const logger = require("../utils/logger");
const { getIO } = require("../websocket/socket");

const simulateProcessing = async (message, requestId, projectId) => {
  const io = getIO();

  const log = (text, type = "info") => {
    const payload = {
      projectId,
      requestId,
      message: text,
      type,
      time: new Date().toLocaleTimeString(),
    };

    io.emit(`logs-${projectId}`, payload);
    io.emit("project-log", payload);
  };

  log(`Processing ${message}`);

  const start = Date.now();

  //simulate delay (0-2 sec)
  const delay = Math.random() * 2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // simulate failure (30% chance)
  const fail = Math.random() < 0.3;

  const latency = Date.now() - start;

  if (fail) {
    log(`Failed ${message}`, "error");
    recordRequest(projectId, latency, false);
  } else {
    log(`Success ${message}`, "success");
    recordRequest(projectId, latency, true);
  }

  // 💀 EMIT PROJECT METRICS
  const m= getMetrics(projectId)

  io.emit(`metrics-${projectId}`,{
    totalRequests: m.totalRequests,
    success: m.success,
    failure: m.failure,
    avgLatency:
      m.totalRequests > 0
        ? Math.round(m.totalLatency / m.totalRequests)
        : 0,
  });
};

module.exports = { simulateProcessing };
