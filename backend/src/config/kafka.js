const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "chaosforge",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const producer = kafka.producer();

let isConnected = false;

const connectProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log("✅ Kafka Producer Connected");
  }
};

module.exports = { kafka, producer, connectProducer };