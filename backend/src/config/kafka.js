const { Kafka, Partitioners, logLevel } = require("kafkajs");

const TRAFFIC_TOPIC = "traffic-topic";
const TEST_TOPIC = "test-topic";
const TOPIC_REPLICATION_FACTOR = Number(
  process.env.KAFKA_TOPIC_REPLICATION_FACTOR || 1,
);
const TRAFFIC_TOPIC_PARTITIONS = Number(
  process.env.KAFKA_TRAFFIC_TOPIC_PARTITIONS || 6,
);
const TEST_TOPIC_PARTITIONS = Number(
  process.env.KAFKA_TEST_TOPIC_PARTITIONS || 1,
);

const isProductionKafka =
  process.env.KAFKA_BROKER?.includes("confluent");

const kafka = new Kafka({
  clientId: "chaosforge",

  brokers: [
    process.env.KAFKA_BROKER || "localhost:9092",
  ],

  ssl: isProductionKafka,

  sasl: isProductionKafka
    ? {
        mechanism: "plain",

        username: process.env.KAFKA_USERNAME,

        password: process.env.KAFKA_PASSWORD,
      }
    : undefined,

  retry: {
    retries: 10,
    initialRetryTime: 300,
  },

  connectionTimeout: 10000,

  requestTimeout: 30000,

  logLevel: logLevel.ERROR,
});

const producer = kafka.producer({
  createPartitioner:
    Partitioners.LegacyPartitioner,
});

const consumer = kafka.consumer({
  groupId: "traffic-group",
});

let producerConnected = false;
let consumerConnected = false;

let topicsReadyPromise = null;

const ensureKafkaTopics = async () => {
  /**
   * 💀 Confluent Cloud topics are managed manually
   */
  if (isProductionKafka) {
    return;
  }

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

              numPartitions: TRAFFIC_TOPIC_PARTITIONS,

              replicationFactor: TOPIC_REPLICATION_FACTOR,
            },

            {
              topic: TEST_TOPIC,

              numPartitions: TEST_TOPIC_PARTITIONS,

              replicationFactor: TOPIC_REPLICATION_FACTOR,
            },
          ],
        });

        console.log("Kafka topics ready");

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
  if (!producerConnected) {
    await ensureKafkaTopics();

    await producer.connect();

    producerConnected = true;

    console.log("Kafka Producer Connected");
  }
};

const connectConsumer = async () => {
  if (!consumerConnected) {
    await ensureKafkaTopics();

    await consumer.connect();

    consumerConnected = true;

    console.log("Kafka Consumer Connected");
  }
};

module.exports = {
  kafka,

  producer,

  consumer,

  connectProducer,

  connectConsumer,

  ensureKafkaTopics,

  TRAFFIC_TOPIC,

  TEST_TOPIC,
};
