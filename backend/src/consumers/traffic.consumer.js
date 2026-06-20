require("../config/env");
const { consumer, connectConsumer, TRAFFIC_TOPIC } = require("../config/kafka");
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

  const processingTimestamps = {};
  const processedCountsByRun = new Map();

  consumer
    .run({
      eachMessage: async ({ partition, message, topic }) => {
        try {
          const data = JSON.parse(message.value.toString());
          const timestamp = Date.now();

          // Skip completion messages
          if (data.type === "traffic-complete") {
            const runKey = `${data.projectId}:${data.runId}`;
            logger.warn({
              message: "TRAFFIC_COMPLETE_RECEIVED - FINAL COUNT",
              totalProcessedBeforeCompletion:
                processedCountsByRun.get(runKey) || 0,
              completionMessagePartition: partition,
              projectId: data.projectId,
              runId: data.runId,
              timestamp,
              completionMessageTimeMs: Date.now(),
            });
            return;
          }

          const {
            requestId,
            projectId,
            runId,
            url,
            owner,
            method,
            headers,
            body,
            queryParams,
          } = data;
          const runKey = `${projectId}:${runId}`;
          const processedCount = (processedCountsByRun.get(runKey) || 0) + 1;
          processedCountsByRun.set(runKey, processedCount);

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
          simulateProcessing(
            url,
            requestId,
            projectId,
            runId,
            owner,
            method,
            headers,
            body,
            queryParams,
          )
            .then(() => {
              const processingTimeMs =
                Date.now() - processingTimestamps[requestId];
              delete processingTimestamps[requestId];

              if (processingTimeMs > 1000) {
                logger.warn({
                  message: "Slow request completed",
                  requestId,
                  projectId,
                  runId,
                  processingTimeMs,
                });
              }
            })
            .catch((err) => {
              const processingTimeMs =
                Date.now() - processingTimestamps[requestId];
              delete processingTimestamps[requestId];

              logger.error({
                message: "Background request processing error",
                requestId,
                projectId,
                runId,
                error: err.message,
                processingTimeMs,
              });
            });
        } catch (err) {
          logger.error({
            message: "Kafka processing error",
            error: err.message,
            stack: err.stack,
          });
        }
      },
    })
    .catch((err) => {
      logger.error({
        message: "Kafka consumer stopped unexpectedly",
        error: err.message,
        stack: err.stack,
      });
    });
};

module.exports = runConsumer;
