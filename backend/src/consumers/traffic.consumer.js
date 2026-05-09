require("dotenv").config();
const { Kafka } = require("kafkajs");
const {
  ensureKafkaTopics,
  TRAFFIC_TOPIC,
} = require("../config/kafka");
const { simulateProcessing } = require("../services/simulation.service");
const { getMetrics } = require("../metrics/metrics.store");
const { emitBufferedLog, getIO } = require("../websocket/socket");
const logger = require("../utils/logger");

const useKafka = process.env.USE_KAFKA === "true";

const kafka = new Kafka({
  clientId: "traffic-consumer",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "traffic-group" });

const runConsumer = async () => {
  if (!useKafka) {
    logger.info("Kafka disabled. Consumer not started.");
    return;
  }

  await ensureKafkaTopics();

  await consumer.connect();

  await consumer.subscribe({
    topic: TRAFFIC_TOPIC,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const data = JSON.parse(message.value.toString());

        // Skip completion messages
        if (data.type === "traffic-complete") {
          return;
        }

        const { requestId, projectId, runId, url } = data;

        logger.info({
          requestId,
          message: `Processing ${url}`,
        });

        // 💀 NO AWAIT → parallel execution
        simulateProcessing(url, requestId, projectId, runId);

      } catch (err) {
        logger.error({
          message: "Kafka processing error",
          error: err.message,
        });
      }
    }
  });
};

module.exports = runConsumer;
