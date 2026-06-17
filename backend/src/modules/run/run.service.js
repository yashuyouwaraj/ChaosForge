const Run = require("./run.model");
const logger = require("../../utils/logger");
const { getMetrics } = require("../../metrics/metrics.store");
const { generateInfrastructureMemory } = require("../memory/memory.generator");

const ACTIVE_STATUSES = ["starting", "running", "paused"];
const COMPLETION_GRACE_MS = 30000;

const getExpectedDurationMs = (run) => {
  const config = run.config || {};

  if (Array.isArray(config.stages)) {
    return (
      config.stages.reduce(
        (total, stage) => total + Number(stage.durationSec || 0),
        0,
      ) * 1000
    );
  }

  const totalRequests = Number(config.totalRequests || 0);
  const rate = Number(config.rate || 0);

  if (totalRequests > 0 && rate > 0) {
    return Math.ceil(totalRequests / rate) * 1000;
  }

  return 0;
};

const getExpectedRequestCount = (run) => {
  const config = run.config || {};

  if (Number(config.totalRequests || 0) > 0) {
    return Number(config.totalRequests);
  }

  return 0;
};

const shouldMarkCompleted = async (run, now = Date.now()) => {
  const expectedRequests = getExpectedRequestCount(run);

  if (expectedRequests > 0) {
    const metrics = await getMetrics(run.projectId, run.runId);

    if (metrics.totalRequests >= expectedRequests) {
      return { complete: true, metrics };
    }
  }

  if (run.status !== "running") {
    return { complete: false };
  }

  const expectedDurationMs = getExpectedDurationMs(run);
  const createdAt = run.createdAt ? new Date(run.createdAt).getTime() : 0;

  if (
    expectedDurationMs > 0 &&
    createdAt > 0 &&
    now > createdAt + expectedDurationMs + COMPLETION_GRACE_MS
  ) {
    const metrics = await getMetrics(run.projectId, run.runId);
    return { complete: true, metrics };
  }

  return { complete: false };
};

const completeFinishedActiveRuns = async (filter = {}) => {
  const activeRuns = await Run.find({
    ...filter,
    status: { $in: ACTIVE_STATUSES },
  });
  const now = Date.now();

  await Promise.all(
    activeRuns.map(async (run) => {
      try {
        const result = await shouldMarkCompleted(run, now);

        if (!result.complete) {
          return;
        }

        const metrics =
          result.metrics || (await getMetrics(run.projectId, run.runId));

        await Run.updateOne(
          { _id: run._id, status: { $in: ACTIVE_STATUSES } },
          {
            $set: {
              status: "completed",
              completedAt: new Date(),
              totalRequests: metrics.totalRequests,
              success: metrics.success,
              failure: metrics.failure,
              avgLatency: metrics.avgLatency,
              p95Latency: metrics.p95Latency,
              rps: metrics.rps,
              errorTypes: metrics.errorTypes,
              latencyTimeline: metrics.latencyTimeline,
              latencyBuckets: metrics.latencyBuckets,
              failureTimeline: metrics.failureTimeline,
            },
          },
        );

        await generateInfrastructureMemory({
          projectId: run.projectId,
          runId: run.runId,

          totalRequests: metrics.totalRequests,
          success: metrics.success,
          failure: metrics.failure,

          avgLatency: metrics.avgLatency,
          p95Latency: metrics.p95Latency,

          rps: metrics.rps,
        });
        
      } catch (err) {
        logger.warn({
          message: "Failed to reconcile active run status",
          runId: run.runId,
          error: err.message,
        });
      }
    }),
  );
};

const saveRun = async (data) => {
  try {
    logger.info({
      message: "Saving run to database",
      projectId: data.projectId,
      runId: data.runId,
      status: data.status,
      metrics: {
        totalRequests: data.totalRequests,
        success: data.success,
        failure: data.failure,
        avgLatency: data.avgLatency,
        p95Latency: data.p95Latency,
        rps: data.rps,
        hasErrorTypes: !!data.errorTypes,
        hasLatencyTimeline: !!data.latencyTimeline,
        hasLatencyBuckets: !!data.latencyBuckets,
      },
    });
    return await Run.findOneAndUpdate(
      { projectId: data.projectId, runId: data.runId },
      { $set: data },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );
  } catch (err) {
    logger.error({
      message: "Error saving run",
      error: err.message,
      data,
    });
    throw err;
  }
};

const getRunsByProject = async (projectId, userId) => {
  try {
    await completeFinishedActiveRuns({ projectId, owner: userId });
    return await Run.find({ projectId, owner: userId }).sort({ createdAt: -1 });
  } catch (err) {
    logger.error({
      message: "Error fetching runs",
      error: err.message,
      projectId,
    });
    throw err;
  }
};

module.exports = {
  saveRun,
  getRunsByProject,
  completeFinishedActiveRuns,
};
