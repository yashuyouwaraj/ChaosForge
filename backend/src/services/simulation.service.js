const { recordRequest, getMetrics } = require("../metrics/metrics.store");
const { getIO, emitBufferedLog } = require("../websocket/socket");
const axios = require("axios");

const simulateProcessing = async (url, requestId, projectId, runId) => {
  const io = getIO();

  const start = Date.now();

  try {
    const res = await axios.get(url, { timeout: 3000 });

    const latency = Date.now() - start;

    await recordRequest(projectId, runId, latency, true);

    emitBufferedLog(projectId, {
      requestId,
      message: `✅ ${url} - ${res.status}`,
      type: "success",
      time: new Date().toLocaleTimeString(),
    });
  } catch (err) {
    const latency = Date.now() - start;

    const errorType = err.code === "ECONNABORTED"
      ? "timeout"
      : err.response
        ? "server"
        : "network";

    await recordRequest(projectId, runId, latency, false, errorType);

    emitBufferedLog(projectId, {
      requestId,
      message: `❌ ${url} - ${err.message}`,
      type: "error",
      time: new Date().toLocaleTimeString(),
    });
  }

  // 📊 Emit updated metrics
  const metrics = await getMetrics(projectId, runId);
  io.emit(`metrics-${projectId}`, metrics);
};

module.exports = { simulateProcessing };
