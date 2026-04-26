const { recordRequest, getMetrics } = require("../metrics/metrics.store");
const { getIO, emitBufferedLog } = require("../websocket/socket");
const axios = require("axios");

const simulateProcessing = async (url, requestId, projectId) => {
  const io = getIO();

  const start = Date.now();

  try {
    const res = await axios.get(url, { timeout: 3000 });

    const latency = Date.now() - start;

    recordRequest(projectId, latency, true);

    emitBufferedLog(projectId, {
      requestId,
      message: `✅ ${url} - ${res.status}`,
      type: "success",
      time: new Date().toLocaleTimeString(),
    });

  } catch (err) {
    const latency = Date.now() - start;

    recordRequest(projectId, latency, false);

    emitBufferedLog(projectId, {
      requestId,
      message: `❌ ${url} - ${err.message}`,
      type: "error",
      time: new Date().toLocaleTimeString(),
    });
  }

  // 📊 Emit updated metrics
  const m = getMetrics(projectId);

  io.emit(`metrics-${projectId}`, {
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