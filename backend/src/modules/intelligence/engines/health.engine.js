const { rate, clampScore, getErrorCount } = require("../utils/metrics.util");

/**
 * Canonical health score formula (0–100).
 * Deductions: failure rate tiers, avg/p95 latency tiers, error type count.
 */
const getHealthStatus = (score) => {
  if (score >= 90) {
    return "excellent";
  }

  if (score >= 75) {
    return "good";
  }

  if (score >= 50) {
    return "warning";
  }

  return "critical";
};

const getHealthGrade = (score) => {
  if (score >= 90) {
    return "A";
  }

  if (score >= 75) {
    return "B";
  }

  if (score >= 50) {
    return "C";
  }

  return "D";
};

const buildHealth = (metrics, healthTrend = "Stable") => {
  const failureRate = rate(metrics.failure, metrics.totalRequests);
  const errorCount = getErrorCount(metrics.errorTypes);
  const reasoning = [];
  let score = 100;

  if (failureRate > 20) {
    score -= 30;
    reasoning.push(`Failure rate ${failureRate.toFixed(1)}% exceeded 20% threshold (-30).`);
  } else if (failureRate > 10) {
    score -= 20;
    reasoning.push(`Failure rate ${failureRate.toFixed(1)}% exceeded 10% threshold (-20).`);
  } else if (failureRate > 5) {
    score -= 10;
    reasoning.push(`Failure rate ${failureRate.toFixed(1)}% exceeded 5% threshold (-10).`);
  } else if (failureRate > 0) {
    score -= 5;
    reasoning.push(`Non-zero failure rate ${failureRate.toFixed(1)}% (-5).`);
  }

  if (metrics.avgLatency > 2000) {
    score -= 20;
    reasoning.push(`Average latency ${metrics.avgLatency}ms exceeded 2000ms (-20).`);
  } else if (metrics.avgLatency > 1000) {
    score -= 15;
    reasoning.push(`Average latency ${metrics.avgLatency}ms exceeded 1000ms (-15).`);
  } else if (metrics.avgLatency > 500) {
    score -= 8;
    reasoning.push(`Average latency ${metrics.avgLatency}ms exceeded 500ms (-8).`);
  }

  if (metrics.p95Latency > 3000) {
    score -= 20;
    reasoning.push(`P95 latency ${metrics.p95Latency}ms exceeded 3000ms (-20).`);
  } else if (metrics.p95Latency > 2000) {
    score -= 15;
    reasoning.push(`P95 latency ${metrics.p95Latency}ms exceeded 2000ms (-15).`);
  } else if (metrics.p95Latency > 1000) {
    score -= 8;
    reasoning.push(`P95 latency ${metrics.p95Latency}ms exceeded 1000ms (-8).`);
  }

  if (errorCount > 0) {
    const deduction = Math.min(20, Math.ceil(errorCount / 5) * 5);
    score -= deduction;
    reasoning.push(`${errorCount} categorized error(s) detected (-${deduction}).`);
  }

  if (reasoning.length === 0) {
    reasoning.push("All core metrics within healthy operational thresholds.");
  }

  score = clampScore(score);
  const status = getHealthStatus(score);

  return {
    score,
    status,
    grade: getHealthGrade(score),
    reasoning,
    trend: healthTrend,
  };
};

module.exports = {
  buildHealth,
  getHealthStatus,
  getHealthGrade,
};
