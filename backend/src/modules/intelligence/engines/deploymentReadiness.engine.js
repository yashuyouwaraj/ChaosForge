const { rate, clampScore } = require("../utils/metrics.util");

const buildDeploymentReadiness = ({
  metrics,
  health,
  risk,
  chaosReport,
}) => {
  const failureRate = rate(metrics.failure, metrics.totalRequests);
  const successRate = rate(metrics.success, metrics.totalRequests);
  const resilienceRate = chaosReport?.metrics?.resilienceRate || 0;

  return {
    availability: clampScore(successRate || 100),
    reliability: clampScore(100 - failureRate * 2),
    performance: clampScore(
      100 -
        (metrics.avgLatency > 500 ? (metrics.avgLatency - 500) / 30 : 0) -
        (metrics.p95Latency > 1000 ? (metrics.p95Latency - 1000) / 40 : 0),
    ),
    resilience: clampScore(
      chaosReport?.enabled
        ? resilienceRate || 75
        : Math.max(55, health.score - 10),
    ),
    observability: clampScore(
      65 +
        (metrics.latencyTimeline?.length > 0 ? 15 : 0) +
        (metrics.failureTimeline?.length > 0 ? 10 : 0) +
        (metrics.latencyBuckets ? 10 : 0),
    ),
    overall: clampScore(
      (health.score + (100 - risk.risk) + (successRate || 100)) / 3,
    ),
  };
};

module.exports = {
  buildDeploymentReadiness,
};
