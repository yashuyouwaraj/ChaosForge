const { Kafka } = require("kafkajs");
const { simulateProcessing } = require("../services/simulation.service");
const logger = require("../utils/logger");

const useKafka = process.env.USE_KAFKA === "true";

const kafka = new Kafka({
  clientId: "traffic-consumer",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "traffic-group" });

const runConsumer = async () => {
  if (!useKafka) {
    logger.info("Kafka disabled in production. Traffic consumer will not start.");
    return;
  }

  await consumer.connect();

  await consumer.subscribe({ topic: "traffic-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const data = JSON.parse(message.value.toString());
        const { requestId, request, projectId } = data;

        logger.info({ requestId, message: `Received ${request}` });

        await simulateProcessing(request, requestId, projectId);
      } catch (error) {
        logger.error({
          message: "Failed to process Kafka message",
          error: error.message,
          rawMessage: message.value ? message.value.toString() : null,
        });
      }
    },
  });
};

module.exports = runConsumer;
