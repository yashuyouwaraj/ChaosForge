const { Kafka } = require("kafkajs");
const { simulateProcessing } = require("../services/simulation.service");
const logger = require("../utils/logger");

const kafka = new Kafka({
  clientId: "traffic-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "traffic-group" });

const runConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {

      const data = JSON.parse(message.value.toString());

      const {requestId, request} = data;

      logger.info({requestId, message:`Received ${request}`})

      await simulateProcessing(request, requestId);
    },
  });
};

module.exports = runConsumer;
