require("dotenv").config();
const runConsumer = require("./consumers/traffic.consumer");

const startWorkers = async () => {
  console.log("🚀 Starting Kafka Worker...");
  await runConsumer();
};

startWorkers();
