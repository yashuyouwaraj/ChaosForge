const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { simulateProcessing } = require("./simulation.service");
const { producer, connectProducer } = require("../config/kafka");
const { emitBufferedLog } = require("../websocket/socket");
const { client: redis } = require("../config/redis");
const { getMetrics } = require("../metrics/metrics.store");
const { saveRun } = require("../modules/run/run.service");
const {} = require("../control/control.store")

const useKafka = process.env.USE_KAFKA === "true";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/*
 * 🔥 MAIN ENTRY
 */
const generateTraffic = async (config, projectId, url) => {
  const runId = uuidv4();
  await initControl(projectId, runId);

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
  const rate = Number(config.rate || 50);

  const totalBatches = Math.ceil(requestCount / rate);

  if (!useKafka) {
    for (let batch = 0; batch < totalBatches; batch++) {
      const promises = [];

      for (
        let i = 0;
        i < rate && batch * rate + i < requestCount;
        i++
      ) {
        promises.push(
          simulateProcessing(url, uuidv4(), projectId, runId)
        );
      }

      await Promise.all(promises);
      await delay(1000);
    }
    return;
  }

  await connectProducer();

  for (let batch = 0; batch < totalBatches; batch++) {
    const messages = [];

    for (
      let i = 0;
      i < rate && batch * rate + i < requestCount;
      i++
    ) {
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
      const { durationSec, rate } = stage;

      const end = Date.now() + durationSec * 1000;

      while (Date.now() < end) {
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
    const { durationSec, rate } = stage;

    const end = Date.now() + durationSec * 1000;

    while (Date.now() < end) {
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

module.exports = { generateTraffic };