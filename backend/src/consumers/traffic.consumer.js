const { Kafka } = require("kafkajs");
const { simulateProcessing } = require("../services/simulation.service");
const logger = require("../utils/logger");

const kafka = new Kafka({
  clientId: "traffic-consumer",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "traffic-group" });

const runConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const data = JSON.parse(message.value.toString());
        const { requestId, request } = data;

        logger.info({ requestId, message: `Received ${request}` });

        await simulateProcessing(request, requestId);
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
