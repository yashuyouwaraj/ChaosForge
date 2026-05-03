const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { simulateProcessing } = require("./simulation.service");
const { producer, connectProducer } = require("../config/kafka");
const { emitBufferedLog } = require("../websocket/socket");
const { client: redis } = require("../config/redis");
const { getMetrics } = require("../metrics/metrics.store");
const { saveRun } = require("../modules/run/run.service");

const useKafka = process.env.USE_KAFKA === "true";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateTraffic = async (total, projectId, url, rate = 50) => {
  await redis.del(`metrics:${projectId}`);
  await redis.del(`latencies:${projectId}`);
  await redis.del(`timestamps:${projectId}`);
  await redis.del(`errors:${projectId}`);
  await redis.del(`failures:${projectId}`);
  const runId = uuidv4();

  const requestCount = Number.parseInt(total, 10);
  const batchSize = Number.parseInt(rate, 10) || 50;

  if (!Number.isInteger(requestCount) || requestCount <= 0) {
    return;
  }

  if (!useKafka) {
    const totalBatches = Math.ceil(requestCount / batchSize);

    logger.info({
      message: `Starting controlled load: ${requestCount} requests at ${batchSize}/sec`,
      projectId,
    });

    for (let batch = 0; batch < totalBatches; batch++) {
      const promises = [];

      for (
        let i = 0;
        i < batchSize && batch * batchSize + i < requestCount;
        i++
      ) {
        promises.push(simulateProcessing(url, uuidv4(), projectId, runId));
      }

      await Promise.all(promises);

      if (batch < totalBatches - 1) {
        await delay(1000);
      }
    }

    emitBufferedLog(projectId, {
      requestId: uuidv4(),
      message: `Completed ${requestCount} requests`,
      type: "complete",
      time: new Date().toLocaleTimeString(),
    });

    logger.info({
      message: "Completed controlled load",
      projectId,
    });

    // 📊 Save run metrics to database
    const finalMetrics = await getMetrics(projectId, runId);
    await saveRun({
      projectId,
      runId,
      ...finalMetrics,
    });

    return;
  }

  await connectProducer();

  const totalBatches = Math.ceil(requestCount / batchSize);

  for (let batch = 0; batch < totalBatches; batch++) {
    const messages = [];

    for (
      let i = 0;
      i < batchSize && batch * batchSize + i < requestCount;
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

    // 💀 SEND BATCH (FAST)
    await producer.send({
      topic: "traffic-topic",
      messages,
    });

    // simulate rate
    if (batch < totalBatches - 1) {
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
          total: requestCount,
          requestId: uuidv4(),
        }),
      },
    ],
  });

  // 📊 Save run metrics to database (after all traffic is processed)
  const finalMetrics = await getMetrics(projectId, runId);
  await saveRun({
    projectId,
    runId,
    ...finalMetrics,
  });
};

module.exports = { generateTraffic };
