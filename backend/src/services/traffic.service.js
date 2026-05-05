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
  if (config.pattern === "stages") {
    await runStages(config, projectId, url, runId);
  } 
  // 🟦 DEFAULT REQUEST MODE (BACKWARD COMPATIBLE)
  else {
    await runRequestMode(config, projectId, url, runId);
  }

  // ⏳ wait for processing
  await delay(useKafka ? 3000 : 500);

  const finalMetrics = await getMetrics(projectId, runId);

  logger.info({
    message: "Captured metrics",
    projectId,
    runId,
    metrics: finalMetrics,
  });

  await saveRun({
    projectId,
    runId,
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
      if (state === "stopped") return;

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
    return;
  }

  await connectProducer();

  while (sent < requestCount) {
    const state = await waitIfPaused(projectId, runId);
    if (state === "stopped") return;

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
};


/**
 * 💀 STAGES MODE (DAY 41 MAGIC)
 */
const runStages = async (config, projectId, url, runId) => {
  const stages = config.stages || [];

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
        if (state === "stopped") return;

        const rate = await getEffectiveRate(projectId, runId, baseRate);
        const promises = [];

        for (let i = 0; i < rate; i++) {
          promises.push(
            simulateProcessing(url, uuidv4(), projectId, runId)
          );
        }

        await Promise.all(promises);
        await delay(1000);
      }
    }
    return;
  }

  await connectProducer();

  for (const stage of stages) {
    const { durationSec } = stage;
    const baseRate = Number(stage.rate || 0);

    const end = Date.now() + durationSec * 1000;

    while (Date.now() < end) {
      const state = await waitIfPaused(projectId, runId);
      if (state === "stopped") return;

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

module.exports = { generateTraffic };
