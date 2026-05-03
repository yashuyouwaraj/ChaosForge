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
  const runId = uuidv4();
  
  // 🧹 RESET METRICS FOR THIS RUN
  await redis.del(`metrics:${projectId}:${runId}`);
  await redis.del(`latencies:${projectId}:${runId}`);
  await redis.del(`timestamps:${projectId}:${runId}`);
  await redis.del(`errors:${projectId}:${runId}`);
  await redis.del(`failures:${projectId}:${runId}`);

  const requestCount = Number.parseInt(total, 10);
  const batchSize = Number.parseInt(rate, 10) || 50;

  if (!Number.isInteger(requestCount) || requestCount <= 0) {
    return;
  }

  if (!useKafka) {
    const totalBatches = Math.ceil(requestCount / batchSize);
    let requestCounter = 0;

    logger.info({
      message: `Starting controlled load: ${requestCount} requests at ${batchSize}/sec`,
      projectId,
      runId,
    });

    for (let batch = 0; batch < totalBatches; batch++) {
      const promises = [];

      for (
        let i = 0;
        i < batchSize && batch * batchSize + i < requestCount;
        i++
      ) {
        requestCounter++;
        promises.push(simulateProcessing(url, uuidv4(), projectId, runId));
      }

      logger.info({
        message: `Batch ${batch + 1}/${totalBatches}: Fired ${promises.length} requests (total: ${requestCounter}/${requestCount})`,
        projectId,
        runId,
      });

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
      message: "All requests fired, waiting for processing...",
      projectId,
      runId,
      totalFired: requestCounter,
      totalExpected: requestCount,
    });

    // 📊 Wait a bit for all Redis operations to settle before capturing metrics
    await delay(500);
    
    const finalMetrics = await getMetrics(projectId, runId);
    
    logger.info({
      message: "Captured metrics",
      projectId,
      runId,
      requestsFired: requestCounter,
      requestsRecorded: finalMetrics.totalRequests,
      metrics: finalMetrics,
    });
    
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

  logger.info({
    message: "Traffic generation complete, waiting for consumer processing...",
    projectId,
    runId,
  });

  // 📊 Wait for Kafka consumer to process all messages + Redis operations to settle
  await delay(3000);
  
  const finalMetrics = await getMetrics(projectId, runId);
  
  logger.info({
    message: "Captured metrics from Kafka traffic",
    projectId,
    runId,
    metrics: finalMetrics,
  });
  
  await saveRun({
    projectId,
    runId,
    ...finalMetrics,
  });
};

module.exports = { generateTraffic };
