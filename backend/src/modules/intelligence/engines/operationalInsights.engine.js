const { rate, round } = require("../utils/metrics.util");

const buildOperationalInsights = ({
  metrics,
  infrastructureMemory = {},
  risk,
  rootCause = [],
  recommendations = [],
}) => {
  const insights = [];
  const failureRate = rate(metrics.failure, metrics.totalRequests);
  const patterns = Array.isArray(infrastructureMemory.patterns)
    ? infrastructureMemory.patterns
    : [];

  if (metrics.p95Latency > metrics.avgLatency * 2 && metrics.p95Latency > 0) {
    insights.push({
      severity: "warning",
      title: "Tail Latency Spread",
      description:
        "P95 latency is materially higher than average latency, indicating uneven response behavior.",
      recommendation:
        "Evaluate distributed request balancing and worker scaling efficiency.",
    });
  }

  if (failureRate > 0) {
    insights.push({
      severity: failureRate > 10 ? "critical" : "warning",
      title: "Failure Rate Detected",
      description: `${round(failureRate)}% of requests failed during this run.`,
      recommendation:
        "Inspect upstream dependencies and implement adaptive retry backoff strategies.",
    });
  }

  const hasRecurringLatency = patterns.some(
    (pattern) => pattern.patternType === "tail_latency",
  );

  if (hasRecurringLatency && metrics.p95Latency > 1000) {
    insights.push({
      severity: "high",
      title: "Recurring Latency Degradation Pattern",
      description:
        "Historical infrastructure memory and active telemetry both indicate repeated tail latency instability.",
      recommendation:
        "Evaluate distributed request balancing and worker scaling efficiency.",
    });
  }

  if (
    metrics.avgLatency > 1000 &&
    metrics.rps >= 100 &&
    (risk?.level === "high" || risk?.level === "critical")
  ) {
    insights.push({
      severity: "high",
      title: "Distributed Saturation Correlation",
      description:
        "Operational saturation signals correlate strongly with predictive infrastructure degradation forecasting.",
      recommendation:
        "Increase horizontal worker scaling and reduce queue contention pressure.",
    });
  }

  if (risk?.level === "critical" && rootCause.length >= 2) {
    insights.push({
      severity: "critical",
      title: "Cascading Infrastructure Instability Risk",
      description:
        "Predictive degradation signals combined with operational root causes indicate elevated probability of cascading instability.",
      recommendation:
        "Reduce traffic pressure, stabilize worker throughput, and inspect infrastructure bottlenecks immediately.",
    });
  }

  if (metrics.rps < 30 && metrics.totalRequests > 0) {
    insights.push({
      severity: "info",
      title: "Low Throughput",
      description:
        "Observed throughput is low relative to typical stress-test targets.",
      recommendation: "Increase worker concurrency and optimize bottlenecks.",
    });
  } else if (metrics.rps >= 30) {
    insights.push({
      severity: "info",
      title: "Throughput Sustained",
      description: `The run sustained approximately ${metrics.rps} requests per second.`,
      recommendation: "Continue monitoring distributed telemetry.",
    });
  }

  if (infrastructureMemory.totalPatterns > 0) {
    insights.push({
      severity: "warning",
      title: "Historical Patterns Present",
      description: `${infrastructureMemory.totalPatterns} infrastructure memory pattern(s) exist for this project.`,
      recommendation:
        "Review recurring patterns before the next release validation run.",
    });
  }

  if (recommendations.length >= 3) {
    insights.push({
      severity: "moderate",
      title: "Multi-Layer Recovery Workflow Active",
      description:
        "Multiple remediation recommendations are active for this run.",
      recommendation:
        "Continue monitoring infrastructure recovery and stabilization effectiveness.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      severity: "info",
      title: "Operational Intelligence Stable",
      description:
        "Realtime telemetry, predictive analysis, historical memory, and anomaly detection indicate stable infrastructure behavior.",
      recommendation:
        "Continue monitoring distributed telemetry and operational health signals.",
    });
  }

  return insights;
};

module.exports = {
  buildOperationalInsights,
};
