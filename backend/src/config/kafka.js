const { Kafka, Partitioners } = require("kafkajs");

const TRAFFIC_TOPIC = "traffic-topic";
const TEST_TOPIC = "test-topic";

const kafka = new Kafka({
  clientId: "chaosforge",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

let isConnected = false;
let topicsReadyPromise = null;

const ensureKafkaTopics = async () => {
  if (!topicsReadyPromise) {
    topicsReadyPromise = (async () => {
      const admin = kafka.admin();

      await admin.connect();

      try {
        await admin.createTopics({
          waitForLeaders: true,
          topics: [
            {
              topic: TRAFFIC_TOPIC,
              numPartitions: 1,
              replicationFactor: 1,
            },
            {
              topic: TEST_TOPIC,
              numPartitions: 1,
              replicationFactor: 1,
            },
          ],
        });
      } finally {
        await admin.disconnect();
      }
    })().catch((err) => {
      topicsReadyPromise = null;
      throw err;
    });
  }

  return topicsReadyPromise;
};

const connectProducer = async () => {
  if (!isConnected) {
    await ensureKafkaTopics();
    await producer.connect();
    isConnected = true;
    console.log("Kafka Producer Connected");
  }
};

module.exports = {
  kafka,
  producer,
  connectProducer,
  ensureKafkaTopics,
  TRAFFIC_TOPIC,
  TEST_TOPIC,
};
