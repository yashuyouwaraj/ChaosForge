const { getMetrics } = require("../../metrics/metrics.store");
const Run = require("../run/run.model");

async function buildOperationalReport({ runId, projectId }) {
  // First, try to fetch from MongoDB (saved run data)
  const savedRun = await Run.findOne({ projectId, runId }); 

  let metrics;

  if (savedRun && savedRun.totalRequests > 0) {
    // Use MongoDB data if available
    metrics = {
      totalRequests: savedRun.totalRequests || 0,
      success: savedRun.success || 0,
      failure: savedRun.failure || 0,
      avgLatency: savedRun.avgLatency || 0,
      p95Latency: savedRun.p95Latency || 0,
      rps: savedRun.rps || 0,
      errorTypes: savedRun.errorTypes || {},
      latencyBuckets: savedRun.latencyBuckets || {},
      failureTimeline: savedRun.failureTimeline || [],
    };
  } else {
    // Fallback to Redis if run not saved yet
    metrics = await getMetrics(projectId, runId);
  }

  return {
    generatedAt: new Date().toISOString(),

    runId,

    projectId,

    overview: {
      totalRequests: metrics.totalRequests || 0,

      success: metrics.success || 0,

      failure: metrics.failure || 0,

      avgLatency: metrics.avgLatency || 0,

      p95Latency: metrics.p95Latency || 0,

      rps: metrics.rps || 0,
    },

    errorTypes: metrics.errorTypes || {},

    rawMetrics: metrics,
  };
}

module.exports = {
  buildOperationalReport,
};
