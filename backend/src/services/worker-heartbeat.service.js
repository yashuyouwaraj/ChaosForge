const os = require("os");
const { randomUUID } = require("crypto");

const { client: redis } = require("../config/redis");

const KAFKA_WORKER_HEARTBEAT_KEY =
  "health:kafka-workers";

const WORKER_HEARTBEAT_INTERVAL_MS = Number(
  process.env.WORKER_HEARTBEAT_INTERVAL_MS || 5000,
);

const WORKER_HEARTBEAT_TTL_MS = Number(
  process.env.WORKER_HEARTBEAT_TTL_MS || 15000,
);

const workerId = [
  os.hostname(),
  process.pid,
  randomUUID(),
].join(":");

const pruneExpiredWorkers = async () => {
  await redis.zRemRangeByScore(
    KAFKA_WORKER_HEARTBEAT_KEY,
    0,
    Date.now() - WORKER_HEARTBEAT_TTL_MS,
  );
};

const recordKafkaWorkerHeartbeat = async () => {
  await redis.zAdd(
    KAFKA_WORKER_HEARTBEAT_KEY,
    [
      {
        score: Date.now(),
        value: workerId,
      },
    ],
  );

  await pruneExpiredWorkers();

  await redis.expire(
    KAFKA_WORKER_HEARTBEAT_KEY,
    Math.ceil(
      (WORKER_HEARTBEAT_TTL_MS * 2) / 1000,
    ),
  );
};

const getConnectedKafkaWorkerCount = async () => {
  await pruneExpiredWorkers();

  return redis.zCard(
    KAFKA_WORKER_HEARTBEAT_KEY,
  );
};

const startKafkaWorkerHeartbeat = () => {
  recordKafkaWorkerHeartbeat().catch((err) => {
    console.error(
      "Kafka worker heartbeat failed:",
      err.message,
    );
  });

  const intervalId = setInterval(() => {
    recordKafkaWorkerHeartbeat().catch((err) => {
      console.error(
        "Kafka worker heartbeat failed:",
        err.message,
      );
    });
  }, WORKER_HEARTBEAT_INTERVAL_MS);

  intervalId.unref?.();

  return intervalId;
};

module.exports = {
  getConnectedKafkaWorkerCount,
  startKafkaWorkerHeartbeat,
};
