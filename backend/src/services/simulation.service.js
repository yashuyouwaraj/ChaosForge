const { recordRequest } = require("../metrics/metrics.store");
const { emitBufferedLog } = require("../websocket/socket");

const {
  simulationRequestsTotal,
  requestLatency,
  simulationFailuresTotal,
} = require("../metrics/prometheus");

const axios = require("axios");
const logger = require("../utils/logger");

const MAX_RETRIES = 3;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const simulateProcessing = async (
  url,
  requestId,
  projectId,
  runId,
  method = "GET",
  headers = {},
  body = null,
  queryParams = {},
) => {
  const normalizedMethod = String(method || "GET").toUpperCase();
  let attempt = 0;

  let success = false;

  let finalLatency = 0;

  let finalErrorType = "network";

  while (attempt < MAX_RETRIES && !success) {
    const start = Date.now();

    try {
      logger.info({
        message: "request_start",
        requestId,
        runId,
        projectId,
        attempt: attempt + 1,
        url,
        method: normalizedMethod,
      });

      const response = await axios({
        method: normalizedMethod,
        url,

        headers,

        params: queryParams,

        data: ["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod)
          ? body
          : undefined,

        timeout: 5000,
      });

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

      /**
       * 💀 STORE METRICS
       */
      try {
        await recordRequest(projectId, runId, finalLatency, true);
        logger.debug({
          message: "METRIC_RECORDED_SUCCESS",
          requestId,
          projectId,
          runId,
          latency: finalLatency,
        });
      } catch (metricErr) {
        logger.error({
          message: "METRIC_RECORDING_FAILED",
          requestId,
          projectId,
          runId,
          latency: finalLatency,
          error: metricErr.message,
        });
        throw metricErr;
      }

      /**
       * 💀 PROMETHEUS METRICS
       */
      simulationRequestsTotal.inc();

      requestLatency.observe(finalLatency);

      /**
       * 💀 BUFFERED LOGS
       */
      emitBufferedLog(projectId, runId, {
        requestId,

        message:
          `✅ ${url} - ${response.status} ` +
          `(try ${attempt + 1}/${MAX_RETRIES})`,

        type: "success",

        level: "info",

        time: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      finalLatency = Date.now() - start;

      /**
       * 💀 ERROR CLASSIFICATION
       */
      finalErrorType =
        err.code === "ECONNABORTED"
          ? "timeout"
          : err.response
            ? "server"
            : "network";

      /**
       * 💀 FINAL FAILURE
       */
      if (attempt + 1 >= MAX_RETRIES) {
        logger.error({
          message: "request_failed",
          requestId,
          runId,
          projectId,
          latency: finalLatency,
          attempts: attempt + 1,
          errorType: finalErrorType,
        });

        try {
          await recordRequest(
            projectId,
            runId,
            finalLatency,
            false,
            finalErrorType,
          );
          logger.debug({
            message: "METRIC_RECORDED_FAILURE",
            requestId,
            projectId,
            runId,
            latency: finalLatency,
            errorType: finalErrorType,
          });
        } catch (metricErr) {
          logger.error({
            message: "METRIC_RECORDING_FAILED_FOR_FAILURE",
            requestId,
            projectId,
            runId,
            error: metricErr.message,
          });
          throw metricErr;
        }

        /**
         * 💀 PROMETHEUS FAILURE METRIC
         */
        simulationRequestsTotal.inc();

        simulationFailuresTotal.inc();

        requestLatency.observe(finalLatency);

        emitBufferedLog(projectId, runId, {
          requestId,

          message:
            `❌ ${url} - ${err.message} ` + `(after ${MAX_RETRIES} attempts)`,

          type: "error",

          level: "error",

          time: new Date().toLocaleTimeString(),
        });
      } else {
        /**
         * 💀 EXPONENTIAL BACKOFF
         */
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

          message:
            `Retrying ${url} after ${err.message} ` +
            `(try ${attempt + 1}/${MAX_RETRIES})`,

          type: "retry",

          level: "warn",

          time: new Date().toLocaleTimeString(),
        });

        await delay(retryInMs);
      }
    }

    /**
     * 💀 ALWAYS INCREMENT ATTEMPT
     */
    attempt++;
  }
};

module.exports = {
  simulateProcessing,
};
