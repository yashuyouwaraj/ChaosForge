const { getMetrics } = require("../../metrics/metrics.store");
const Run = require("../run/run.model");
const {
  generateSimulationInsights,
} = require("../../services/simulationAnalysisEngine");

const buildMetricsFromRun = (run) => ({
  totalRequests: run.totalRequests || 0,
  success: run.success || 0,
  failure: run.failure || 0,
  avgLatency: run.avgLatency || 0,
  p95Latency: run.p95Latency || 0,
  rps: run.rps || 0,
  currentRps: 0,
  latencyBuckets: run.latencyBuckets || {
    "0-500": 0,
    "500-1000": 0,
    "1000-2000": 0,
    "2000+": 0,
  },
  errorTypes: run.errorTypes || {
    timeout: 0,
    network: 0,
    server: 0,
  },
  failureTimeline: run.failureTimeline || [],
});

const getAiAnalysis = async (projectId, runId) => {
  const savedRun = await Run.findOne({ projectId, runId });

  const metrics =
    savedRun && savedRun.totalRequests > 0
      ? buildMetricsFromRun(savedRun)
      : await getMetrics(projectId, runId);

  const analysis = generateSimulationInsights(metrics);

  return {
    generatedAt: new Date(),
    metrics,
    ...analysis,
  };
};

module.exports = {
  getAiAnalysis,
};
