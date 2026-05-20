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

  consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const data = JSON.parse(message.value.toString());

        // Skip completion messages
        if (data.type === "traffic-complete") {
          return;
        }

        const { requestId, projectId, runId, url, method } = data;

        logger.info({
          requestId,
          message: `Processing ${url}`,
        });

        // 💀 NO AWAIT → parallel execution
        simulateProcessing(url, requestId, projectId, runId, method);

      } catch (err) {
        logger.error({
          message: "Kafka processing error",
          error: err.message,
        });
      }
    }
  }).catch((err) => {
    logger.error({
      message: "Kafka consumer stopped unexpectedly",
      error: err.message,
    });
  });
};

module.exports = runConsumer;
