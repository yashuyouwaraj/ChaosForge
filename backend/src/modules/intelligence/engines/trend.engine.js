const { rate, round, percentDelta, pointDelta } = require("../utils/metrics.util");
const { buildHealth } = require("./health.engine");
const { buildRisk } = require("./risk.engine");

const classifyTrend = (current, baseline, lowerIsBetter = false) => {
  if (baseline == null || baseline === undefined) {
    return {
      value: baseline,
      trend: "Stable",
    };
  }

  const delta = round(current - baseline);
  const absDelta = Math.abs(delta);
  const stableThreshold = Math.max(1, Math.abs(baseline) * 0.05);

  if (absDelta <= stableThreshold) {
    return {
      value: baseline,
      delta,
      trend: "Stable",
    };
  }

  const improved = lowerIsBetter ? delta < 0 : delta > 0;

  return {
    value: baseline,
    delta,
    trend: improved ? "Improved" : "Regressed",
  };
};

const averageField = (runs, field) => {
  if (!runs.length) {
    return null;
  }

  const sum = runs.reduce((total, run) => total + (Number(run[field]) || 0), 0);
  return sum / runs.length;
};

const bestField = (runs, field, lowerIsBetter = false) => {
  if (!runs.length) {
    return null;
  }

  return runs.reduce((best, run) => {
    const value = Number(run[field]) || 0;

    if (best == null) {
      return value;
    }

    return lowerIsBetter
      ? Math.min(best, value)
      : Math.max(best, value);
  }, null);
};

const worstField = (runs, field, lowerIsBetter = false) => {
  if (!runs.length) {
    return null;
  }

  return runs.reduce((worst, run) => {
    const value = Number(run[field]) || 0;

    if (worst == null) {
      return value;
    }

    return lowerIsBetter
      ? Math.max(worst, value)
      : Math.min(worst, value);
  }, null);
};

const buildMetricTrend = ({
  current,
  previousRun,
  historicalRuns,
  field,
  lowerIsBetter = false,
  rateField = false,
}) => {
  const currentValue = rateField
    ? rate(current[field === "failureRate" ? "failure" : field], current.totalRequests)
    : Number(current[field]) || 0;

  const previousValue = previousRun
    ? rateField
      ? rate(previousRun.failure, previousRun.totalRequests)
      : Number(previousRun[field]) || 0
    : null;

  const historicalValues = historicalRuns.map((run) =>
    rateField ? rate(run.failure, run.totalRequests) : Number(run[field]) || 0,
  );

  return {
    current: round(currentValue),
    previousRun: previousRun
      ? {
          value: round(previousValue),
          ...classifyTrend(currentValue, previousValue, lowerIsBetter),
        }
      : { value: null, trend: "Stable" },
    historicalAverage: {
      value: round(averageField(historicalRuns, field)),
      ...classifyTrend(
        currentValue,
        averageField(historicalRuns, field),
        lowerIsBetter,
      ),
    },
    historicalBest: {
      value: round(
        rateField
          ? bestField(historicalRuns, "failure", true)
          : bestField(historicalRuns, field, lowerIsBetter),
      ),
      trend: "Stable",
    },
    historicalWorst: {
      value: round(
        rateField
          ? worstField(historicalRuns, "failure", true)
          : worstField(historicalRuns, field, lowerIsBetter),
      ),
      trend: "Stable",
    },
  };
};

const compareValue = (current, previous, lowerIsBetter = false) => {
  if (previous == null && previous !== 0) {
    return {
      current,
      previous: null,
      delta: null,
      trend: "No baseline",
    };
  }

  const delta = round(current - previous);
  const absDelta = Math.abs(delta);
  const stableThreshold = Math.max(1, Math.abs(previous) * 0.05);
  let trend = "Stable";

  if (absDelta > stableThreshold) {
    const improved = lowerIsBetter ? delta < 0 : delta > 0;
    trend = improved ? "Improved" : "Regressed";
  }

  return {
    current,
    previous,
    delta,
    trend,
  };
};

const buildHistoricalComparison = ({ savedRun, previousRun }) => {
  if (!savedRun || !previousRun) {
    return {
      hasPreviousRun: false,
      metrics: {},
    };
  }

  const currentSuccessRate = round(
    rate(savedRun.success, savedRun.totalRequests),
  );
  const previousSuccessRate = round(
    rate(previousRun.success, previousRun.totalRequests),
  );
  const currentFailureRate = round(
    rate(savedRun.failure, savedRun.totalRequests),
  );
  const previousFailureRate = round(
    rate(previousRun.failure, previousRun.totalRequests),
  );
  const currentHealth = buildHealth(savedRun).score;
  const previousHealth = buildHealth(previousRun).score;
  const currentRisk = buildRisk(savedRun).risk;
  const previousRisk = buildRisk(previousRun).risk;

  return {
    hasPreviousRun: true,
    previousRunId: previousRun.runId,
    metrics: {
      latency: compareValue(
        savedRun.avgLatency || 0,
        previousRun.avgLatency || 0,
        true,
      ),
      p95: compareValue(
        savedRun.p95Latency || 0,
        previousRun.p95Latency || 0,
        true,
      ),
      failureRate: compareValue(currentFailureRate, previousFailureRate, true),
      rps: compareValue(savedRun.rps || 0, previousRun.rps || 0),
      healthScore: compareValue(currentHealth, previousHealth),
      successRate: compareValue(currentSuccessRate, previousSuccessRate),
      riskScore: compareValue(currentRisk, previousRisk, true),
    },
  };
};

const buildTrends = ({ metrics, savedRun, previousRun, historicalRuns }) => {
  const current = savedRun || metrics;

  return {
    latency: buildMetricTrend({
      current,
      previousRun,
      historicalRuns,
      field: "avgLatency",
      lowerIsBetter: true,
    }),
    failure: buildMetricTrend({
      current,
      previousRun,
      historicalRuns,
      field: "failureRate",
      lowerIsBetter: true,
      rateField: true,
    }),
    success: buildMetricTrend({
      current,
      previousRun,
      historicalRuns,
      field: "success",
      lowerIsBetter: false,
    }),
    rps: buildMetricTrend({
      current,
      previousRun,
      historicalRuns,
      field: "rps",
      lowerIsBetter: false,
    }),
    health: (() => {
      const currentHealth = buildHealth(current).score;
      const previousHealth = previousRun ? buildHealth(previousRun).score : null;
      const historicalHealthScores = historicalRuns.map(
        (run) => buildHealth(run).score,
      );
      const avgHealth =
        historicalHealthScores.length > 0
          ? historicalHealthScores.reduce((a, b) => a + b, 0) /
            historicalHealthScores.length
          : null;

      return {
        current: currentHealth,
        previousRun: previousRun
          ? {
              value: previousHealth,
              ...classifyTrend(currentHealth, previousHealth, false),
            }
          : { value: null, trend: "Stable" },
        historicalAverage: {
          value: round(avgHealth),
          ...classifyTrend(currentHealth, avgHealth, false),
        },
        historicalBest: {
          value:
            historicalHealthScores.length > 0
              ? Math.max(...historicalHealthScores)
              : null,
          trend: "Stable",
        },
        historicalWorst: {
          value:
            historicalHealthScores.length > 0
              ? Math.min(...historicalHealthScores)
              : null,
          trend: "Stable",
        },
      };
    })(),
    risk: (() => {
      const currentRisk = buildRisk(current).risk;
      const previousRisk = previousRun ? buildRisk(previousRun).risk : null;
      const historicalRiskScores = historicalRuns.map((run) => buildRisk(run).risk);
      const avgRisk =
        historicalRiskScores.length > 0
          ? historicalRiskScores.reduce((a, b) => a + b, 0) /
            historicalRiskScores.length
          : null;

      return {
        current: currentRisk,
        previousRun: previousRun
          ? {
              value: previousRisk,
              ...classifyTrend(currentRisk, previousRisk, true),
            }
          : { value: null, trend: "Stable" },
        historicalAverage: {
          value: round(avgRisk),
          ...classifyTrend(currentRisk, avgRisk, true),
        },
        historicalBest: {
          value:
            historicalRiskScores.length > 0
              ? Math.min(...historicalRiskScores)
              : null,
          trend: "Stable",
        },
        historicalWorst: {
          value:
            historicalRiskScores.length > 0
              ? Math.max(...historicalRiskScores)
              : null,
          trend: "Stable",
        },
      };
    })(),
    deltas: previousRun
      ? {
          p95Latency: round(
            percentDelta(current.p95Latency, previousRun.p95Latency),
          ),
          avgLatency: round(
            percentDelta(current.avgLatency, previousRun.avgLatency),
          ),
          failure: round(
            pointDelta(
              rate(current.failure, current.totalRequests),
              rate(previousRun.failure, previousRun.totalRequests),
            ),
          ),
          rps: round(percentDelta(current.rps, previousRun.rps)),
          successRate: round(
            pointDelta(
              rate(current.success, current.totalRequests),
              rate(previousRun.success, previousRun.totalRequests),
            ),
          ),
        }
      : null,
    operationalTrend: (() => {
      if (!previousRun) {
        return "No baseline";
      }

      const comparison = buildHistoricalComparison({
        savedRun: current,
        previousRun,
      });
      const latencyRegressed =
        comparison.metrics.latency?.trend === "Regressed" ||
        comparison.metrics.p95?.trend === "Regressed";
      const reliabilityRegressed =
        comparison.metrics.failureRate?.trend === "Regressed" ||
        comparison.metrics.successRate?.trend === "Regressed";

      if (latencyRegressed && reliabilityRegressed) {
        return "Degraded";
      }

      if (reliabilityRegressed) {
        return "Degraded";
      }

      if (
        comparison.metrics.successRate?.trend === "Improved" ||
        comparison.metrics.rps?.trend === "Improved"
      ) {
        return "Improved";
      }

      return "Stable";
    })(),
  };
};

const buildHistoricalIntelligence = (infrastructureMemory = {}) => {
  const patterns = Array.isArray(infrastructureMemory.patterns)
    ? infrastructureMemory.patterns
    : [];

  const mapTrendEvolution = (trend) => {
    if (trend === "degrading" || trend === "worsening") {
      return "Regressed";
    }

    if (trend === "improving") {
      return "Improved";
    }

    return "Stable";
  };

  return {
    recurringIssues: patterns.map((pattern) => ({
      title: pattern.title || "Infrastructure Pattern",
      patternType: pattern.patternType,
      trendDirection: pattern.trend || "stable",
      firstSeen: pattern.firstDetectedAt || null,
      lastSeen: pattern.lastDetectedAt || null,
      detectionCount: pattern.detectionCount || 0,
      riskEvolution: mapTrendEvolution(pattern.trend),
      confidence: pattern.confidence || 0,
      recommendation:
        pattern.recommendation ||
        "Continue monitoring this pattern across future runs.",
    })),
  };
};

module.exports = {
  buildTrends,
  buildHistoricalComparison,
  buildHistoricalIntelligence,
  compareValue,
};
