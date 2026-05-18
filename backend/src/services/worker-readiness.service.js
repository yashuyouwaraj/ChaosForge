const {
  getConnectedKafkaWorkerCount,
} = require("./worker-heartbeat.service");

const WORKER_READY_TIMEOUT_MS = Number(
  process.env.WORKER_READY_TIMEOUT_MS || 180000,
);

const WORKER_READY_POLL_MS = Number(
  process.env.WORKER_READY_POLL_MS || 3000,
);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isKafkaEnabled = () => process.env.USE_KAFKA === "true";

const getExpectedWorkerCount = () => Math.max(
  1,
  Number(process.env.WORKER_EXPECTED_COUNT || 1),
);

const waitForWorkerHeartbeat = async (targetWorkerCount = 1) => {
  const startedAt = Date.now();
  const requiredWorkers = Math.max(1, targetWorkerCount);

  while (Date.now() - startedAt < WORKER_READY_TIMEOUT_MS) {
    const connectedWorkers = await getConnectedKafkaWorkerCount();

    if (connectedWorkers >= requiredWorkers) {
      return connectedWorkers;
    }

    await delay(WORKER_READY_POLL_MS);
  }

  return 0;
};

const ensureKafkaWorkersReady = async () => {
  if (!isKafkaEnabled()) {
    return {
      ready: true,
      connectedWorkers: 0,
      skipped: true,
      reason: "kafka_disabled",
    };
  }

  const targetWorkerCount = getExpectedWorkerCount();
  const connectedWorkers = await getConnectedKafkaWorkerCount();

  if (connectedWorkers >= targetWorkerCount) {
    return {
      ready: true,
      connectedWorkers,
      skipped: false,
      reason: "workers_already_ready",
    };
  }

  const readyWorkers = await waitForWorkerHeartbeat(targetWorkerCount);

  return {
    ready: readyWorkers >= targetWorkerCount,
    connectedWorkers: readyWorkers,
    skipped: false,
    reason:
      readyWorkers >= targetWorkerCount
        ? "workers_ready"
        : "worker_ready_timeout",
  };
};

module.exports = {
  ensureKafkaWorkersReady,
};
