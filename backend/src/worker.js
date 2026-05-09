require("dotenv").config();

const connectDB = require("./config/db");

const { connectRedis } = require("./config/redis");

const { connectProducer } = require("./config/kafka");

const runConsumer = require("./consumers/traffic.consumer");

const useKafka = process.env.USE_KAFKA === "true";

connectDB();

const startWorker = async () => {
  try {
    await connectRedis();

    if (useKafka) {
      await connectProducer();

      await runConsumer();

      console.log("Kafka worker started.");
    } else {
      console.log("Kafka disabled.");
    }

  } catch (err) {
    console.error("Worker startup failed:", err);

    process.exit(1);
  }
};

startWorker();