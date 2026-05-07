const { recordRequest, getMetrics } = require("../metrics/metrics.store");
const { getIO, emitBufferedLog } = require("../websocket/socket");
const axios = require("axios");
const logger = require("../utils/logger");

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
      logger.info({
        message: "request_start",
        requestId,
        runId,
        projectId,
        attempt: attempt + 1,
        url,
      });

      const res = await axios.get(url, { timeout: 3000 });

      finalLatency = Date.now() - start;
      success = true;

      logger.info({
        message: "request_success",
        requestId,
        runId,
        projectId,
        latency: finalLatency,
        attempts: attempt + 1,
      });

      await recordRequest(projectId, runId, finalLatency, true);

      emitBufferedLog(projectId, runId, {
        requestId,
        message: `✅ ${url} - ${res.status} (try ${attempt + 1}/${MAX_RETRIES + 1})`,
        type: "success",
        level: "info",
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
        logger.error({
          message: "request_failed",
          requestId,
          runId,
          projectId,
          latency: finalLatency,
          attempts: attempt + 1,
          errorType: finalErrorType,
        });
        // ❌ final failure
        await recordRequest(
          projectId,
          runId,
          finalLatency,
          false,
          finalErrorType,
        );

        emitBufferedLog(projectId, runId, {
          requestId,
          message: `❌ ${url} - ${err.message} (after ${MAX_RETRIES + 1} attempts)`,
          type: "error",
          level: "error",
          time: new Date().toLocaleTimeString(),
        });
      } else {
        // 🔥 exponential backoff
        const retryInMs = 100 * Math.pow(2, attempt);

        logger.warn({
          message: "request_retry",
          requestId,
          runId,
          projectId,
          attempt: attempt + 1,
          errorType: finalErrorType,
          retryInMs,
        });

        emitBufferedLog(projectId, runId, {
          requestId,
          message: `Retrying ${url} after ${err.message} (try ${attempt + 1}/${MAX_RETRIES + 1})`,
          type: "retry",
          level: "warn",
          time: new Date().toLocaleTimeString(),
        });

        await delay(retryInMs);
      }
    }

    attempt++; // ✅ always increment
  }

  // 📊 Emit metrics (optional: throttle later)
  const metrics = await getMetrics(projectId, runId);
  io.emit(`metrics-${projectId}-${runId}`, metrics);
};

module.exports = { simulateProcessing };
