require("./config/env");

const http = require("http");

const connectDB = require("./config/db");

const { connectRedis } = require("./config/redis");

const { connectProducer } = require("./config/kafka");

const runConsumer = require("./consumers/traffic.consumer");
const {
  startKafkaWorkerHeartbeat,
} = require("./services/worker-heartbeat.service");

const useKafka = process.env.USE_KAFKA === "true";

let workerStatus = "starting";

const startHealthServer = () => {
  const port = process.env.WORKER_HEALTH_PORT;

  if (!port) {
    return;
  }

  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify({
        status: workerStatus,
        role: "worker",
        kafka: useKafka ? "enabled" : "disabled",
        timestamp: new Date().toISOString(),
      }));

      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/plain",
    });

    res.end("ChaosForge worker is running");
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(
        `Worker health server skipped because port ${port} is already in use.`,
      );

      return;
    }

    throw err;
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`Worker health server running on port ${port}`);
  });
};

const startWorker = async () => {
  try {
    startHealthServer();

    await connectDB();

    await connectRedis();

    if (useKafka) {
      await connectProducer();
      await runConsumer();
      startKafkaWorkerHeartbeat();
      workerStatus = "running";
      console.log("Kafka worker started.");
    } else {
      workerStatus = "running";
      console.log("Kafka disabled.");
    }

  } catch (err) {
    workerStatus = "error";
    console.error("Worker startup failed:", err);

    process.exit(1);
  }
};

startWorker();
