const logger = require("../utils/logger");
const {
  getConnectedKafkaWorkerCount,
} = require("./worker-heartbeat.service");

const WORKER_READY_TIMEOUT_MS = Number(
  process.env.WORKER_READY_TIMEOUT_MS || 180000,
);

const WORKER_READY_POLL_MS = Number(
  process.env.WORKER_READY_POLL_MS || 3000,
);

const WORKER_WAKE_TIMEOUT_MS = Number(
  process.env.WORKER_WAKE_TIMEOUT_MS || 30000,
);

const WORKER_WAKE_RETRY_MS = Number(
  process.env.WORKER_WAKE_RETRY_MS || 15000,
);

const WORKER_BACKGROUND_WAKE_MIN_INTERVAL_MS = Number(
  process.env.WORKER_BACKGROUND_WAKE_MIN_INTERVAL_MS || 60000,
);

let lastBackgroundWakeAt = 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isKafkaEnabled = () => process.env.USE_KAFKA === "true";

const getConfiguredWorkerUrls = () => {
  return (process.env.WORKER_WAKE_URLS || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
};

const toHealthUrl = (url) => {
  const normalizedUrl = url.replace(/\/+$/, "");
  return normalizedUrl.endsWith("/health")
    ? normalizedUrl
    : `${normalizedUrl}/health`;
};

const wakeWorker = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    WORKER_WAKE_TIMEOUT_MS,
  );

  try {
    const response = await fetch(toHealthUrl(url), {
      method: "GET",
      signal: controller.signal,
    });

    return response.ok;
  } catch (err) {
    logger.warn({
      message: "Worker wake request failed",
      workerUrl: url,
      error: err.message,
    });

    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

const wakeWorkers = async (workerUrls) => {
  if (workerUrls.length === 0) {
    return;
  }

  logger.info({
    message: "Waking Kafka workers before simulation",
    workers: workerUrls.length,
  });

  await Promise.allSettled(workerUrls.map(wakeWorker));
};

const wakeConfiguredWorkers = async () => {
  const workerUrls = getConfiguredWorkerUrls();
  await wakeWorkers(workerUrls);

  return {
    workerCount: workerUrls.length,
  };
};

const wakeConfiguredWorkersInBackground = () => {
  const now = Date.now();

  if (
    now - lastBackgroundWakeAt <
    WORKER_BACKGROUND_WAKE_MIN_INTERVAL_MS
  ) {
    return false;
  }

  lastBackgroundWakeAt = now;

  wakeConfiguredWorkers().catch((err) => {
    logger.warn({
      message: "Worker background wake failed",
      error: err.message,
    });
  });

  return true;
};

const waitForWorkerHeartbeat = async (workerUrls) => {
  const startedAt = Date.now();
  let lastWakeAttemptAt = 0;

  while (Date.now() - startedAt < WORKER_READY_TIMEOUT_MS) {
    const connectedWorkers = await getConnectedKafkaWorkerCount();

    if (connectedWorkers > 0) {
      return connectedWorkers;
    }

    if (
      workerUrls.length > 0 &&
      Date.now() - lastWakeAttemptAt >= WORKER_WAKE_RETRY_MS
    ) {
      lastWakeAttemptAt = Date.now();
      wakeWorkers(workerUrls).catch((err) => {
        logger.warn({
          message: "Worker wake retry failed",
          error: err.message,
        });
      });
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

  const connectedWorkers = await getConnectedKafkaWorkerCount();

  if (connectedWorkers > 0) {
    return {
      ready: true,
      connectedWorkers,
      skipped: false,
      reason: "workers_already_ready",
    };
  }

  const workerUrls = getConfiguredWorkerUrls();
  await wakeWorkers(workerUrls);

  const readyWorkers = await waitForWorkerHeartbeat(workerUrls);

  return {
    ready: readyWorkers > 0,
    connectedWorkers: readyWorkers,
    skipped: false,
    reason:
      readyWorkers > 0
        ? "workers_woke_successfully"
        : "worker_ready_timeout",
  };
};

module.exports = {
  ensureKafkaWorkersReady,
  wakeConfiguredWorkers,
  wakeConfiguredWorkersInBackground,
};
