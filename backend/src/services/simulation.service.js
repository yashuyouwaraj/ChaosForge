const { recordRequest, getMetrics } = require("../metrics/metrics.store");
const { getIO, emitBufferedLog } = require("../websocket/socket");
const metricsStore = require("../metrics/metrics.store");
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

    const metricsData = metricsStore.getMetrics?.(projectId);

    if (metricsData) {
      if (err.code === "ECONNABORTED") metricsData.errorTypes.timeout++;
      else if (err.response) metricsData.errorTypes.server++;
      else metricsData.errorTypes.network++;
    }

    recordRequest(projectId, latency, false);

    emitBufferedLog(projectId, {
      requestId,
      message: `❌ ${url} - ${err.message}`,
      type: "error",
      time: new Date().toLocaleTimeString(),
    });
  }

  // 📊 Emit updated metrics
  const metrics = getMetrics(projectId);
  io.emit(`metrics-${projectId}`, metrics);
};

module.exports = { simulateProcessing };
