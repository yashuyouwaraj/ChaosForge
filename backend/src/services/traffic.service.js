const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { simulateProcessing } = require("./simulation.service");
const { producer, connectProducer } = require("../config/kafka");
const { emitBufferedLog } = require("../websocket/socket");
const { client: redis } = require("../config/redis");
const { getMetrics } = require("../metrics/metrics.store");
const { saveRun } = require("../modules/run/run.service");
const { initControl, getControl } = require("../control/control.store");

const useKafka = process.env.USE_KAFKA === "true";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const FINAL_METRICS_POLL_MS = 1000;
const FINAL_METRICS_MAX_WAIT_MS = 120000;

/*
 * 🔥 MAIN ENTRY
 */
const generateTraffic = async (config, projectId, url, options = {}) => {
  const runId = options.runId || uuidv4();
  if (!options.controlInitialized) {
    await initControl(projectId, runId);
  }

  // 🧹 RESET
  await redis.del(`metrics:${projectId}:${runId}`);
  await redis.del(`latencies:${projectId}:${runId}`);
  await redis.del(`timestamps:${projectId}:${runId}`);
  await redis.del(`errors:${projectId}:${runId}`);
  await redis.del(`failures:${projectId}:${runId}`);

  logger.info({
    message: "Starting simulation",
    projectId,
    runId,
    config,
  });

  // 🟩 STAGES MODE (DAY 41)
  let expectedRequests = 0;

  if (config.pattern === "stages") {
    expectedRequests = await runStages(config, projectId, url, runId);
  } 
  // 🟦 DEFAULT REQUEST MODE (BACKWARD COMPATIBLE)
  else {
    expectedRequests = await runRequestMode(config, projectId, url, runId);
  }

  // ⏳ wait for processing
  if (useKafka) {
    await waitForFinalMetrics(projectId, runId, expectedRequests);
  } else {
    await delay(500);
  }

  const finalMetrics = await getMetrics(projectId, runId);
  const finalControl = await getControl(projectId, runId);
  const finalStatus =
    finalControl.status === "stopped" ? "stopped" : "completed";

  logger.info({
    message: "Captured metrics",
    projectId,
    runId,
    status: finalStatus,
    expectedRequests,
    metrics: finalMetrics,
  });

  await saveRun({
    owner: options.owner,
    projectId,
    runId,
    status: finalStatus,
    config,
    url,
    ...finalMetrics,
  });

  return runId;
};


/**
 * 🟦 REQUEST MODE (existing logic cleaned)
 */
const runRequestMode = async (config, projectId, url, runId) => {
  const requestCount = Number(config.totalRequests || 0);
  const baseRate = Number(config.rate || 50);
  let sent = 0;

  if (!useKafka) {
    while (sent < requestCount) {
      const state = await waitIfPaused(projectId, runId);
      if (state === "stopped") return sent;

      const rate = await getEffectiveRate(projectId, runId, baseRate);
      const promises = [];

      for (let i = 0; i < rate && sent < requestCount; i++) {
        promises.push(
          simulateProcessing(url, uuidv4(), projectId, runId)
        );
        sent++;
      }

      await Promise.all(promises);
      if (sent < requestCount) {
        await delay(1000);
      }
    }
    return sent;
  }

  await connectProducer();

  while (sent < requestCount) {
    const state = await waitIfPaused(projectId, runId);
    if (state === "stopped") return sent;

    const rate = await getEffectiveRate(projectId, runId, baseRate);
    const messages = [];

    for (let i = 0; i < rate && sent < requestCount; i++) {
      messages.push({
        key: projectId,
        value: JSON.stringify({
          projectId,
          url,
          runId,
          requestId: uuidv4(),
        }),
      });
      sent++;
    }

    await producer.send({
      topic: "traffic-topic",
      messages,
    });

    if (sent < requestCount) {
      await delay(1000);
    }
  }

  // completion event
  await producer.send({
    topic: "traffic-topic",
    messages: [
      {
        key: projectId,
        value: JSON.stringify({
          type: "traffic-complete",
          projectId,
          runId,
          requestId: uuidv4(),
        }),
      },
    ],
  });

  return sent;
};


/**
 * 💀 STAGES MODE (DAY 41 MAGIC)
 */
const runStages = async (config, projectId, url, runId) => {
  const stages = config.stages || [];
  let sent = 0;

  logger.info({
    message: "Running staged load",
    stages,
    projectId,
    runId,
  });

  if (!useKafka) {
    for (const stage of stages) {
      const { durationSec } = stage;
      const baseRate = Number(stage.rate || 0);

      const end = Date.now() + durationSec * 1000;

      while (Date.now() < end) {
        const state = await waitIfPaused(projectId, runId);
        if (state === "stopped") return sent;

        const rate = await getEffectiveRate(projectId, runId, baseRate);
        const promises = [];

        for (let i = 0; i < rate; i++) {
          promises.push(
            simulateProcessing(url, uuidv4(), projectId, runId)
          );
          sent++;
        }

        await Promise.all(promises);
        await delay(1000);
      }
    }
    return sent;
  }

  await connectProducer();

  for (const stage of stages) {
    const { durationSec } = stage;
    const baseRate = Number(stage.rate || 0);

    const end = Date.now() + durationSec * 1000;

    while (Date.now() < end) {
      const state = await waitIfPaused(projectId, runId);
      if (state === "stopped") return sent;

      const rate = await getEffectiveRate(projectId, runId, baseRate);
      const messages = [];

      for (let i = 0; i < rate; i++) {
        messages.push({
          key: projectId,
          value: JSON.stringify({
            projectId,
            url,
            runId,
            requestId: uuidv4(),
          }),
        });
        sent++;
      }

      await producer.send({
        topic: "traffic-topic",
        messages,
      });

      await delay(1000);
    }
  }

  // completion event
  await producer.send({
    topic: "traffic-topic",
    messages: [
      {
        key: projectId,
        value: JSON.stringify({
          type: "traffic-complete",
          projectId,
          runId,
          requestId: uuidv4(),
        }),
      },
    ],
  });

  return sent;
};

const waitIfPaused = async (projectId, runId) => {
  while (true) {
    const { status } = await getControl(projectId, runId);

    if (status === "stopped") return "stopped";
    if (status === "running") return "running";

    await delay(300);
  }
};

const getEffectiveRate = async (projectId, runId, baseRate) => {
  const { rateOverride } = await getControl(projectId, runId);
  return rateOverride && rateOverride > 0 ? rateOverride : baseRate;
};

const waitForFinalMetrics = async (projectId, runId, expectedRequests) => {
  if (!expectedRequests || expectedRequests <= 0) {
    return;
  }

  const startedAt = Date.now();
  let metrics = await getMetrics(projectId, runId);

  while (
    metrics.totalRequests < expectedRequests &&
    Date.now() - startedAt < FINAL_METRICS_MAX_WAIT_MS
  ) {
    const control = await getControl(projectId, runId);

    if (control.status === "stopped") {
      return;
    }

    await delay(FINAL_METRICS_POLL_MS);
    metrics = await getMetrics(projectId, runId);
  }

  if (metrics.totalRequests < expectedRequests) {
    logger.warn({
      message: "Final metrics saved before all expected requests were recorded",
      projectId,
      runId,
      expectedRequests,
      recordedRequests: metrics.totalRequests,
    });
  }
};

module.exports = { generateTraffic };
