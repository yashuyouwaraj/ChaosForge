const { rate, clampScore } = require("../utils/metrics.util");

const buildInfrastructureHealth = ({
  metrics,
  health,
  risk,
  infrastructureMemory = {},
  deploymentReadiness,
}) => ({
  score: health.score,
  status: health.status,
  grade: health.grade,
  riskLevel: risk.level,
  riskScore: risk.risk,
  memoryPatterns: infrastructureMemory.totalPatterns || 0,
  readinessOverall: deploymentReadiness?.overall || health.score,
  signals: {
    failureRate: rate(metrics.failure, metrics.totalRequests),
    avgLatency: metrics.avgLatency,
    p95Latency: metrics.p95Latency,
    rps: metrics.rps,
  },
  summary: clampScore(
    (health.score + (100 - risk.risk) + (deploymentReadiness?.overall || health.score)) /
      3,
  ),
});

module.exports = {
  buildInfrastructureHealth,
};
