const { rate, clampScore } = require("../utils/metrics.util");

/**
 * Canonical predictive risk engine (0–100 risk score).
 */
const buildRisk = (metrics, historicalComparison = null) => {
  const failureRate = rate(metrics.failure, metrics.totalRequests);
  const contributingFactors = [];
  let risk = 10;

  if (failureRate > 20) {
    risk += 35;
    contributingFactors.push("Critical failure rate elevation");
  } else if (failureRate > 10) {
    risk += 25;
    contributingFactors.push("Elevated failure rate");
  } else if (failureRate > 5) {
    risk += 15;
    contributingFactors.push("Moderate failure rate increase");
  } else if (failureRate > 0) {
    risk += 8;
    contributingFactors.push("Non-zero failure rate");
  }

  if (metrics.p95Latency > 3000) {
    risk += 25;
    contributingFactors.push("Critical tail latency pressure");
  } else if (metrics.p95Latency > 2000) {
    risk += 20;
    contributingFactors.push("High tail latency");
  } else if (metrics.p95Latency > 1000) {
    risk += 10;
    contributingFactors.push("Elevated tail latency");
  }

  if (metrics.avgLatency > 1000) {
    risk += 15;
    contributingFactors.push("Infrastructure saturation signal");
  }

  if (metrics.totalRequests > 0 && metrics.rps < 10) {
    risk += 10;
    contributingFactors.push("Low throughput under load");
  }

  if (historicalComparison?.hasPreviousRun) {
    const failureTrend = historicalComparison.metrics?.failureRate?.trend;
    const latencyTrend = historicalComparison.metrics?.p95?.trend;

    if (failureTrend === "Regressed") {
      risk += 10;
      contributingFactors.push("Failure rate regressed vs previous run");
    }

    if (latencyTrend === "Regressed") {
      risk += 10;
      contributingFactors.push("Tail latency regressed vs previous run");
    }
  }

  risk = Math.min(100, risk);

  let level = "stable";
  let forecast =
    "Current metrics indicate low probability of near-term operational degradation.";

  if (risk >= 75) {
    level = "critical";
    forecast =
      "Critical instability risk detected from elevated failures and latency pressure.";
  } else if (risk >= 50) {
    level = "high";
    forecast =
      "High risk of degradation if similar traffic pressure continues.";
  } else if (risk >= 30) {
    level = "moderate";
    forecast =
      "Moderate risk signals are present and should be monitored during subsequent runs.";
  }

  if (contributingFactors.length === 0) {
    contributingFactors.push("Stable operational telemetry");
  }

  const confidence = clampScore(
    95 -
      (metrics.totalRequests === 0 ? 40 : 0) -
      (failureRate > 0 ? 5 : 0) -
      (historicalComparison?.hasPreviousRun ? 0 : 8),
  );

  return {
    risk,
    level,
    confidence,
    forecast,
    contributingFactors,
  };
};

module.exports = {
  buildRisk,
};
