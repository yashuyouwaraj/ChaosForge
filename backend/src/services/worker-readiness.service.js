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

const WORKER_LINK_WAKE_TIMEOUT_MS = Number(
  process.env.WORKER_LINK_WAKE_TIMEOUT_MS || 10000,
);

const WORKER_FIRST_READY_TIMEOUT_MS = Number(
  process.env.WORKER_FIRST_READY_TIMEOUT_MS || 12000,
);

const WORKER_BACKGROUND_WAKE_MIN_INTERVAL_MS = Number(
  process.env.WORKER_BACKGROUND_WAKE_MIN_INTERVAL_MS || 60000,
);

let lastBackgroundWakeAt = 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isKafkaEnabled = () => process.env.USE_KAFKA === "true";

const isProduction = () => process.env.NODE_ENV === "production";

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

const toWakeUrl = (url) => {
  return url.replace(/\/+$/, "");
};

const isWorkerHealthReady = (health) => {
  return (
    health &&
    health.status === "running" &&
    health.role === "worker" &&
    health.kafka === "enabled"
  );
};

const wakeWorkerLink = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    WORKER_LINK_WAKE_TIMEOUT_MS,
  );

  try {
    const response = await fetch(toWakeUrl(url), {
      method: "GET",
      signal: controller.signal,
    });

    return {
      ok: response.ok,
      url,
      statusCode: response.status,
    };
  } catch (err) {
    logger.warn({
      message: "Worker deployment link wake request failed",
      workerUrl: url,
      error: err.message,
    });

    return {
      ok: false,
      url,
      error: err.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
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

const wakeWorkerLinksInBackground = (workerUrls) => {
  if (!isProduction() || workerUrls.length === 0) {
    return false;
  }

  workerUrls.forEach((url) => {
    wakeWorkerLink(url).catch((err) => {
      logger.warn({
        message: "Worker deployment link background wake failed",
        workerUrl: url,
        error: err.message,
      });
    });
  });

  return true;
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

const wakeFirstReadyWorker = async (
  workerUrls,
  timeoutMs = WORKER_WAKE_TIMEOUT_MS,
) => {
  if (workerUrls.length === 0) {
    return null;
  }

  logger.info({
    message: "Checking Kafka workers until one is ready",
    workers: workerUrls.length,
  });

  return new Promise((resolve) => {
    let pending = workerUrls.length;
    let settled = false;

    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, timeoutMs);

    const resolveOnce = (result) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        resolve(result);
      }
    };

    workerUrls.forEach((url) => {
      wakeWorker(url).then((result) => {
        if (result.ready) {
          resolveOnce(result);
          return;
        }

        pending -= 1;

        if (pending === 0) {
          resolveOnce(null);
        }
      }).catch((err) => {
        pending -= 1;

        logger.warn({
          message: "Worker readiness request rejected",
          workerUrl: url,
          error: err.message,
        });

        if (pending === 0) {
          resolveOnce(null);
        }
      });
    });
  });
};

const wakeConfiguredWorkers = async () => {
  const workerUrls = getConfiguredWorkerUrls();
  wakeWorkerLinksInBackground(workerUrls);

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

  const workerUrls = getConfiguredWorkerUrls();
  wakeWorkerLinksInBackground(workerUrls);

  wakeWorkers(workerUrls).catch((err) => {
    logger.warn({
      message: "Worker background health wake failed",
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
  wakeWorkerLinksInBackground(workerUrls);

  const readyWorker = await wakeFirstReadyWorker(
    workerUrls,
    isProduction()
      ? WORKER_FIRST_READY_TIMEOUT_MS
      : WORKER_WAKE_TIMEOUT_MS,
  );

  if (readyWorker) {
    return {
      ready: true,
      connectedWorkers: 1,
      skipped: false,
      reason: "worker_health_ready",
    };
  }

  if (isProduction()) {
    return {
      ready: false,
      connectedWorkers: 0,
      skipped: false,
      reason: "worker_wake_started",
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
