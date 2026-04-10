const { Kafka } = require("kafkajs");
const { simulateProcessing } = require("../services/simulation.service");

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
      const msg = message.value.toString();
      console.log("Received message...", msg);
      await simulateProcessing(msg);
    },
  });
};

module.exports = runConsumer;
