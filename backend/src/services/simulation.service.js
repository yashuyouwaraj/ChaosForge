const { recordRequest, getMetrics } = require("../metrics/metrics.store");
const { getIO, emitBufferedLog } = require("../websocket/socket");
const axios = require("axios");

const MAX_RETRIES = 3;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const simulateProcessing = async (url, requestId, projectId, runId) => {
  const io = getIO();

  let attempt = 0;
  let success = false;
  let finalLatency = 0;
  let finalErrorType = "network";

  while (attempt <= MAX_RETRIES && !success) {
    const start = Date.now(); // ✅ per-attempt timing

    try {
      const res = await axios.get(url, { timeout: 3000 });

      finalLatency = Date.now() - start;
      success = true;

      await recordRequest(projectId, runId, finalLatency, true);

      emitBufferedLog(projectId, {
        requestId,
        message: `✅ ${url} - ${res.status} (attempt ${attempt + 1})`,
        type: "success",
        time: new Date().toLocaleTimeString(),
      });

    } catch (err) {
      finalLatency = Date.now() - start;

      // classify error
      finalErrorType =
        err.code === "ECONNABORTED"
          ? "timeout"
          : err.response
          ? "server"
          : "network";

      if (attempt === MAX_RETRIES) {
        // ❌ final failure
        await recordRequest(projectId, runId, finalLatency, false, finalErrorType);

        emitBufferedLog(projectId, {
          requestId,
          message: `❌ ${url} - ${err.message} (after ${MAX_RETRIES + 1} attempts)`,
          type: "error",
          time: new Date().toLocaleTimeString(),
        });
      } else {
        // 🔥 exponential backoff
        await delay(100 * Math.pow(2, attempt));
      }
    }

    attempt++; // ✅ always increment
  }

  // 📊 Emit metrics (optional: throttle later)
  const metrics = await getMetrics(projectId, runId);
  io.emit(`metrics-${projectId}`, metrics);
};

module.exports = { simulateProcessing };