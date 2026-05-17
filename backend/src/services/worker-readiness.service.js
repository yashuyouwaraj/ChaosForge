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
  process.env.WORKER_WAKE_TIMEOUT_MS || 60000,
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

const isWorkerHealthReady = (health) => {
  return (
    health &&
    health.status === "running" &&
    health.role === "worker" &&
    health.kafka === "enabled"
  );
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

    if (!response.ok) {
      return {
        ok: false,
        ready: false,
        url,
        statusCode: response.status,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    const health = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : null;

    return {
      ok: true,
      ready: isWorkerHealthReady(health),
      url,
      health,
    };
  } catch (err) {
    logger.warn({
      message: "Worker wake request failed",
      workerUrl: url,
      error: err.message,
    });

    return {
      ok: false,
      ready: false,
      url,
      error: err.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

const wakeWorkers = async (workerUrls) => {
  if (workerUrls.length === 0) {
    return [];
  }

  logger.info({
    message: "Waking Kafka workers before simulation",
    workers: workerUrls.length,
  });

  const results = await Promise.allSettled(workerUrls.map(wakeWorker));

  return results.map((result, index) => (
    result.status === "fulfilled"
      ? result.value
      : {
          ok: false,
          ready: false,
          url: workerUrls[index],
          error: result.reason?.message || "Worker wake request rejected",
        }
  ));
};

const wakeConfiguredWorkers = async () => {
  const workerUrls = getConfiguredWorkerUrls();
  const wakeResults = await wakeWorkers(workerUrls);

  return {
    workerCount: workerUrls.length,
    readyWorkers: wakeResults.filter((result) => result.ready).length,
    results: wakeResults,
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
  let healthReadyWorkers = 0;

  while (Date.now() - startedAt < WORKER_READY_TIMEOUT_MS) {
    const connectedWorkers = await getConnectedKafkaWorkerCount();

    if (connectedWorkers > 0) {
      return connectedWorkers;
    }

    if (healthReadyWorkers > 0) {
      return healthReadyWorkers;
    }

    if (
      workerUrls.length > 0 &&
      Date.now() - lastWakeAttemptAt >= WORKER_WAKE_RETRY_MS
    ) {
      lastWakeAttemptAt = Date.now();
      wakeWorkers(workerUrls).then((wakeResults) => {
        healthReadyWorkers = wakeResults.filter((result) => result.ready).length;
      }).catch((err) => {
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
  const wakeResults = await wakeWorkers(workerUrls);
  const healthReadyWorkers = wakeResults.filter((result) => result.ready).length;

  if (healthReadyWorkers > 0) {
    return {
      ready: true,
      connectedWorkers: healthReadyWorkers,
      skipped: false,
      reason: "worker_health_ready",
    };
  }

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
