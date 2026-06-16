const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { simulateProcessing } = require("./simulation.service");
const {
  generateInfrastructureMemory,
} = require("../modules/memory/memory.generator");
const { producer, connectProducer, TRAFFIC_TOPIC } = require("../config/kafka");
const { emitBufferedLog } = require("../websocket/socket");
const { client: redis, connectRedis } = require("../config/redis");
const {
  getMetrics,
  markRunActive,
  markRunComplete,
} = require("../metrics/metrics.store");
const { saveRun } = require("../modules/run/run.service");
const { initControl, getControl } = require("../control/control.store");
const { addIncident } = require("./incidentTimeline");
const { ensureKafkaWorkersReady } = require("./worker-readiness.service");
const Run = require("../modules/run/run.model");

const useKafka = process.env.USE_KAFKA === "true";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const FINAL_METRICS_POLL_MS = 1000;
const FINAL_METRICS_MAX_WAIT_MS = 180000; // 3 minutes for grace period + in-flight requests

/*
 * 🔥 MAIN ENTRY
 */
const generateTraffic = async (config, projectId, url, options = {}) => {
  const runId = options.runId || uuidv4();
  markRunActive(projectId, runId);

  if (!options.controlInitialized) {
    await initControl(projectId, runId);
  }

  // Skip worker readiness check if skipWorkerCheck is set (for testing)
  if (!options.skipWorkerCheck) {
    const workerReadiness = await ensureKafkaWorkersReady();

    if (!workerReadiness.ready) {
      logger.warn({
        message: "Simulation failed because Kafka workers did not become ready",
        projectId,
        runId,
        reason: workerReadiness.reason,
        connectedWorkers: workerReadiness.connectedWorkers,
      });

      throw new Error(
        "Workers did not become ready before the readiness timeout.",
      );
    }
  }

  await Run.updateOne(
    { projectId, runId },
    { $set: { status: "running", createdAt: new Date() } },
  ).catch((err) => {
    logger.warn({
      message: "Failed to mark run as running after worker readiness",
      projectId,
      runId,
      error: err.message,
    });
  });

  const redis = await connectRedis();

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

  addIncident({
    type: "simulation",
    severity: "info",
    title: "Simulation Started",
    message: `Run ${runId} started.`,
    metadata: {
      projectId,
      runId,
      pattern: config.pattern || "requests",
    },
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

  const savedRun = await saveRun({
    owner: options.owner,
    projectId,
    runId,
    status: finalStatus,
    config,
    url,
    ...finalMetrics,
  });

  await generateInfrastructureMemory(savedRun);

  markRunComplete(runId);

  if (finalStatus === "completed") {
    addIncident({
      type: "simulation",
      severity: "info",
      title: "Simulation Completed",
      message: `Run ${runId} completed successfully.`,
      metadata: {
        projectId,
        runId,
      },
    });
  }

  return runId;
};

/**
 * 🟦 REQUEST MODE (existing logic cleaned)
 */
const runRequestMode = async (config, projectId, url, runId) => {
  const requestCount = Number(config.totalRequests || 0);
  const baseRate = Number(config.rate || 50);
  let sent = 0;

  logger.info({
    message: "Starting request mode simulation",
    projectId,
    runId,
    requestCount,
    baseRate,
  });

  if (!useKafka) {
    while (sent < requestCount) {
      const state = await waitIfPaused(projectId, runId);
      if (state === "stopped") return sent;

      const rate = await getEffectiveRate(projectId, runId, baseRate);
      const promises = [];

      for (let i = 0; i < rate && sent < requestCount; i++) {
        promises.push(
          simulateProcessing(url, uuidv4(), projectId, runId, config.method),
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

  let batchNumber = 0;
  let totalMessagesQueuedToKafka = 0;
  
  while (sent < requestCount) {
    const state = await waitIfPaused(projectId, runId);
    if (state === "stopped") {
      logger.warn({
        message: "Simulation stopped by control signal",
        projectId,
        runId,
        sent,
        expected: requestCount,
      });
      return sent;
    }

    const rate = await getEffectiveRate(projectId, runId, baseRate);
    const messages = [];
    const batchStart = sent;

    for (let i = 0; i < rate && sent < requestCount; i++) {
      const requestId = uuidv4();

      messages.push({
        key: requestId,
        value: JSON.stringify({
          projectId,
          url,
          runId,
          requestId,
          method: config.method,
        }),
      });
      sent++;
    }

    if (messages.length > 0) {
      try {
        logger.info({
          message: "BATCH_SEND_START",
          projectId,
          runId,
          batchNumber,
          batchSize: messages.length,
          batchStart,
          batchEnd: sent - 1,
          sentSoFar: sent,
          remaining: requestCount - sent,
        });

        await producer.send({
          topic: TRAFFIC_TOPIC,
          messages,
        });

        totalMessagesQueuedToKafka += messages.length;

        logger.info({
          message: "BATCH_SEND_COMPLETE",
          projectId,
          runId,
          batchNumber,
          batchSize: messages.length,
          totalQueuedSoFar: totalMessagesQueuedToKafka,
          sentSoFar: sent,
        });

        batchNumber++;
      } catch (err) {
        logger.error({
          message: "Failed to send request batch to Kafka",
          projectId,
          runId,
          batchNumber,
          batchSize: messages.length,
          error: err.message,
          stack: err.stack,
        });
        throw err;
      }
    }

    if (sent < requestCount) {
      await delay(1000);
    }
  }

  logger.info({
    message: "ALL_BATCHES_QUEUED",
    projectId,
    runId,
    totalBatches: batchNumber,
    totalMessagesSent: sent,
    totalMessagesQueuedToKafka,
    expected: requestCount,
    mismatch: requestCount - totalMessagesQueuedToKafka,
  });

  // ⚠️ CRITICAL: Extended grace period for in-flight requests to complete
  // Fire-and-forget means workers consume the message but request processing happens in background
  // We need to wait for:
  // 1. Kafka broker to store messages
  // 2. Consumer fetch lag to clear
  // 3. All fire-and-forget HTTP requests to complete (~100-300ms each)
  // 4. Redis metrics writes to finish
  // 5. Consumer to catch up to end of partition
  // Minimum: 15 seconds - this is critical to prevent request loss!
  const preCompletionWaitMs = 15000; // Increased from 5000ms
  logger.info({
    message: "Waiting before sending traffic-complete signal (extended grace period)",
    projectId,
    runId,
    waitMs: preCompletionWaitMs,
    reason: "Allow all in-flight requests to complete + consumer lag + Redis writes",
  });

  await delay(preCompletionWaitMs);

  try {
    await producer.send({
      topic: TRAFFIC_TOPIC,
      messages: [
        {
          // Use projectId as key to ensure completion message goes to same partition as requests for ordering
          key: `${projectId}:completion`,
          value: JSON.stringify({
            type: "traffic-complete",
            projectId,
            runId,
            requestId: uuidv4(),
            timestamp: Date.now(),
          }),
        },
      ],
    });

    logger.info({
      message: "Request mode simulation completed - traffic-complete message sent",
      projectId,
      runId,
      totalSent: sent,
      expected: requestCount,
    });
  } catch (err) {
    logger.error({
      message: "Failed to send traffic-complete message",
      projectId,
      runId,
      error: err.message,
      stack: err.stack,
    });
    throw err;
  }

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
            simulateProcessing(url, uuidv4(), projectId, runId, config.method),
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

  let totalBatchesSent = 0;
  let totalMessagesSentToKafka = 0;

  for (const stage of stages) {
    const { durationSec } = stage;
    const baseRate = Number(stage.rate || 0);

    // ⚠️ CRITICAL FIX: Pre-calculate expected batches instead of relying on time
    // Time-based loop exit causes loss when loop overhead > expected delay
    // Example: if each iteration takes 1.1s instead of 1s, we lose the final batch
    const expectedBatchCount = durationSec; // 1 batch per second
    const expectedMessagesInStage = durationSec * baseRate; // e.g., 30 * 100 = 3000

    const stageStartTime = Date.now();
    const end = stageStartTime + durationSec * 1000;
    let stageMessageCount = 0;
    let batchIteration = 0;

    logger.info({
      message: "Stage starting - PRECISE BATCH TRACKING",
      projectId,
      runId,
      stageDurationSec: durationSec,
      baseRate,
      expectedBatchCount,
      expectedMessagesInStage,
      stageStartTime,
      end,
    });

    // Use batch count instead of time to ensure we send exactly the right number
    while (batchIteration < expectedBatchCount) {
      batchIteration++;
      const iterationStartTime = Date.now();
      const timeRemaining = end - iterationStartTime;

      const state = await waitIfPaused(projectId, runId);
      if (state === "stopped") {
        logger.warn({
          message: "Stage stopped by user",
          projectId,
          runId,
          batchIteration,
          expectedBatchCount,
          stageMessageCount,
        });
        return sent;
      }

      const rate = await getEffectiveRate(projectId, runId, baseRate);
      const messages = [];

      for (let i = 0; i < rate; i++) {
        const requestId = uuidv4();

        messages.push({
          key: requestId,
          value: JSON.stringify({
            projectId,
            url,
            runId,
            requestId,
            method: config.method,
          }),
        });
        sent++;
        stageMessageCount++;
      }

      try {
        logger.info({
          message: "Stage batch sending - CRITICAL VERIFICATION",
          projectId,
          runId,
          batchIteration,
          expectedBatchCount,
          batchSize: messages.length,
          stageMessagesSoFar: stageMessageCount,
          expectedMessagesInStage,
          totalSentSoFar: sent,
          rate,
          timeRemaining,
        });

        await producer.send({
          topic: TRAFFIC_TOPIC,
          messages,
        });
        totalMessagesSentToKafka += messages.length;
        totalBatchesSent++;

        logger.info({
          message: "Stage batch sent successfully - VERIFIED",
          projectId,
          runId,
          batchIteration,
          expectedBatchCount,
          batchSize: messages.length,
          stageMessagesSoFar: stageMessageCount,
          totalSentSoFar: sent,
          totalMessagesSentToKafka,
        });
      } catch (err) {
        logger.error({
          message: "Failed to send stage batch to Kafka",
          projectId,
          runId,
          batchIteration,
          batchSize: messages.length,
          error: err.message,
        });
        throw err;
      }

      // Only delay if not the last batch (no point delaying after final batch)
      if (batchIteration < expectedBatchCount) {
        const delayStartTime = Date.now();
        await delay(1000);
        const delayActual = Date.now() - delayStartTime;

        logger.debug({
          message: "Stage batch delay completed",
          projectId,
          runId,
          batchIteration,
          expectedBatchCount,
          delayRequested: 1000,
          delayActual,
        });
      }
    }

    logger.info({
      message: "Stage completed - batch count verification",
      projectId,
      runId,
      totalBatchesInStage: batchIteration,
      expectedBatchCount,
      totalMessagesInStage: stageMessageCount,
      expectedMessagesInStage,
      accuracy: stageMessageCount === expectedMessagesInStage ? "PERFECT" : "MISMATCH",
      mismatch: expectedMessagesInStage - stageMessageCount,
      durationSec,
      totalElapsedMs: Date.now() - stageStartTime,
    });
  }

  logger.info({
    message: "All stages queued to Kafka",
    projectId,
    runId,
    totalBatches: totalBatchesSent,
    totalMessagesSent: sent,
    totalMessagesSentToKafka,
    expectedRequests_parameter: sent,  // This is what we tell waitForFinalMetrics
  });

  // ⚠️ CRITICAL: Extended grace period to ensure all in-flight requests complete
  // Each request takes ~100-300ms + Redis write time
  // With fire-and-forget, we need to wait for the full HTTP pipeline to complete
  // Plus consumer lag and batch processing time
  // Minimum: 15 seconds to catch stragglers
  const gracePeriodMs = 15000; // Increased from 2000ms
  
  logger.info({
    message: "Waiting before sending traffic-complete signal (extended grace period)",
    projectId,
    runId,
    delayMs: gracePeriodMs,
    reason: "Allow in-flight requests to complete + Redis writes + consumer lag",
    totalMessagesSentToKafka,
  });

  await delay(gracePeriodMs);

  await producer.send({
    topic: TRAFFIC_TOPIC,
    messages: [
      {
        // Use projectId as key to ensure completion message goes to same partition for ordering
        key: `${projectId}:completion`,
        value: JSON.stringify({
          type: "traffic-complete",
          projectId,
          runId,
          requestId: uuidv4(),
          timestamp: Date.now(),
        }),
      },
    ],
  });

  logger.info({
    message: "Staged load simulation completed - traffic-complete message sent",
    projectId,
    runId,
    totalSent: sent,
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
  let consecutiveNoChangeCount = 0;
  let stabilizedAt = null;
  let pollCount = 0;

  logger.info({
    message: "Starting metrics collection",
    projectId,
    runId,
    expectedRequests,
    initialMetrics: metrics.totalRequests,
  });

  while (Date.now() - startedAt < FINAL_METRICS_MAX_WAIT_MS) {
    pollCount++;
    const control = await getControl(projectId, runId);

    if (control.status === "stopped") {
      logger.warn({
        message: "Metrics collection stopped by control signal",
        projectId,
        runId,
        pollCount,
        recordedSoFar: metrics.totalRequests,
      });
      return;
    }

    // Check if we've reached expected count
    if (metrics.totalRequests >= expectedRequests) {
      logger.info({
        message: "All expected requests recorded",
        projectId,
        runId,
        totalRequests: metrics.totalRequests,
        expectedRequests,
        pollsToComplete: pollCount,
        elapsedMs: Date.now() - startedAt,
      });
      return;
    }

    const previousCount = metrics.totalRequests;
    const elapsedMs = Date.now() - startedAt;

    logger.debug({
      message: "Metrics poll",
      projectId,
      runId,
      pollNumber: pollCount,
      recordedRequests: metrics.totalRequests,
      remaining: expectedRequests - metrics.totalRequests,
      elapsedMs,
    });

    await delay(FINAL_METRICS_POLL_MS);
    metrics = await getMetrics(projectId, runId);

    // Track stability: metrics unchanged
    if (metrics.totalRequests === previousCount) {
      consecutiveNoChangeCount++;

      // Mark when metrics first stabilized
      if (consecutiveNoChangeCount === 1) {
        stabilizedAt = Date.now();
        logger.info({
          message: "Metrics stabilized",
          projectId,
          runId,
          recordedRequests: metrics.totalRequests,
          expectedRequests,
          elapsedMs,
        });
      }

      // After metrics stabilize, wait additional buffer for in-flight requests
      // Fire-and-forget means requests are still executing after message is acked
      // Need enough time for HTTP request (~100-300ms) + Redis write (~10ms) + consumer processing
      // 5 polls * 1000ms = 5 seconds of no change = requests have truly stopped arriving
      // Then add 15 more seconds for any stragglers (network delays, slow endpoints, Redis lag)
      if (
        consecutiveNoChangeCount >= 5 &&
        Date.now() - stabilizedAt >= 15000
      ) {
        logger.info({
          message: "Metrics stable for 15+ seconds after 5 consecutive no-change polls, finalizing",
          projectId,
          runId,
          recordedRequests: metrics.totalRequests,
          expectedRequests,
          shortfall: expectedRequests - metrics.totalRequests,
          stabilizationTime: Date.now() - stabilizedAt,
          totalWaitTime: Date.now() - startedAt,
          totalPolls: pollCount,
        });
        break;
      }
    } else {
      // Metrics changed, reset stability counter
      if (consecutiveNoChangeCount > 0) {
        logger.debug({
          message: "Metrics changed, resetting stability counter",
          projectId,
          runId,
          newRecordedRequests: metrics.totalRequests,
          previousCount,
          changeAmount: metrics.totalRequests - previousCount,
        });
      }
      consecutiveNoChangeCount = 0;
      stabilizedAt = null;
    }
  }

  if (metrics.totalRequests < expectedRequests) {
    logger.warn({
      message: "Final metrics saved before all expected requests were recorded",
      projectId,
      runId,
      expectedRequests,
      recordedRequests: metrics.totalRequests,
      shortfall: expectedRequests - metrics.totalRequests,
      percentageRecorded: Math.round(
        (metrics.totalRequests / expectedRequests) * 100,
      ),
      totalPolls: pollCount,
      totalWaitMs: Date.now() - startedAt,
    });
  } else {
    logger.info({
      message: "All expected requests recorded",
      projectId,
      runId,
      totalRequests: metrics.totalRequests,
      totalPolls: pollCount,
      totalWaitMs: Date.now() - startedAt,
    });
  }
};

module.exports = { generateTraffic };
