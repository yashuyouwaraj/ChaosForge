const { rate, round } = require("../utils/metrics.util");

const buildResilience = ({ metrics, chaosReport }) => {
  const resilienceRate = chaosReport?.metrics?.resilienceRate || 0;
  const totalInjected = metrics.chaosInjected || 0;
  const successfulInjections = metrics.chaosSuccess || 0;

  let score = 75;

  if (chaosReport?.enabled && totalInjected > 0) {
    score = Math.round(resilienceRate);
  } else if (metrics.failure > 0) {
    const failureRate = rate(metrics.failure, metrics.totalRequests);
    score = Math.max(0, Math.round(100 - failureRate * 2));
  } else {
    score = 95;
  }

  let status = "stable";

  if (score >= 95) {
    status = "resilient";
  } else if (score >= 80) {
    status = "degraded";
  } else if (totalInjected > 0 || metrics.failure > 0) {
    status = "critical";
  }

  return {
    score,
    status,
    resilienceRate: round(resilienceRate),
    totalInjected,
    successfulInjections,
    failedInjections: metrics.chaosFailure || 0,
    enabled: Boolean(chaosReport?.enabled),
    summary:
      chaosReport?.assessment?.summary ||
      (metrics.failure > 0
        ? "Operational resilience reduced by failure pressure during execution."
        : "No significant resilience degradation detected."),
  };
};

module.exports = {
  buildResilience,
};
