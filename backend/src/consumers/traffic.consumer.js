require("../config/env");
const {
  consumer,
  connectConsumer,
  TRAFFIC_TOPIC,
} = require("../config/kafka");
const { simulateProcessing } = require("../services/simulation.service");
const logger = require("../utils/logger");

const useKafka = process.env.USE_KAFKA === "true";

const runConsumer = async () => {
  if (!useKafka) {
    logger.info("Kafka disabled. Consumer not started.");
    return;
  }

  await connectConsumer();

  await consumer.subscribe({
    topic: TRAFFIC_TOPIC,
    fromBeginning: false,
  });

  let processedCount = 0;
  let completionMessageReceived = false;
  const processingTimestamps = {};
  let lastLoggedCount = 0;
  let currentProjectId = null;
  let currentRunId = null;

  consumer.run({
    eachMessage: async ({ partition, message, topic }) => {
      try {
        const data = JSON.parse(message.value.toString());
        const timestamp = Date.now();

        // Track current run for completion logging
        if (data.projectId) {
          currentProjectId = data.projectId;
          currentRunId = data.runId;
        }

        // Skip completion messages
        if (data.type === "traffic-complete") {
          completionMessageReceived = true;
          logger.warn({
            message: "TRAFFIC_COMPLETE_RECEIVED - FINAL COUNT",
            totalProcessedBeforeCompletion: processedCount,
            completionMessagePartition: partition,
            projectId: data.projectId,
            runId: data.runId,
            timestamp,
            completionMessageTimeMs: Date.now(),
          });
          return;
        }

        const { requestId, projectId, runId, url, method } = data;
        processedCount++;

        // Log every 100 messages for visibility
        if (processedCount % 100 === 0 || processedCount === 1) {
          logger.info({
            message: "CONSUMER_PROGRESS",
            processedCount,
            partition,
            projectId,
            runId,
            timestamp,
          });
        }

        processingTimestamps[requestId] = timestamp;

        // Fire-and-forget for parallel execution across workers
        // Each worker processes messages concurrently (6 workers total)
        // The request will record its own metrics to Redis atomically
        simulateProcessing(url, requestId, projectId, runId, method)
          .then(() => {
            const processingTimeMs = Date.now() - processingTimestamps[requestId];
            if (processingTimeMs > 1000) {
              logger.warn({
                message: "Slow request completed",
                requestId,
                processingTimeMs,
              });
            }
          })
          .catch((err) => {
            logger.error({
              message: "Background request processing error",
              requestId,
              projectId,
              runId,
              error: err.message,
              processingTimeMs: Date.now() - processingTimestamps[requestId],
            });
          });

      } catch (err) {
        logger.error({
          message: "Kafka processing error",
          error: err.message,
          stack: err.stack,
        });
      }
    }
  }).catch((err) => {
    logger.error({
      message: "Kafka consumer stopped unexpectedly",
      error: err.message,
      stack: err.stack,
    });
  });
};

module.exports = runConsumer;
