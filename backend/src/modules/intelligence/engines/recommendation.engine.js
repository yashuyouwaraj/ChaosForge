const { rate, round } = require("../utils/metrics.util");

const CATEGORIES = {
  PERFORMANCE: "Performance",
  RELIABILITY: "Reliability",
  AVAILABILITY: "Availability",
  SCALING: "Scaling",
  NETWORKING: "Networking",
  CHAOS: "Chaos",
  INFRASTRUCTURE: "Infrastructure",
  RETRY_STRATEGY: "Retry Strategy",
  DEPENDENCIES: "Dependencies",
};

/**
 * Canonical recommendation engine.
 */
const buildRecommendations = ({
  metrics,
  risk,
  infrastructureMemory = {},
  configurationSnapshot = null,
  chaosReport = null,
}) => {
  const recommendations = [];
  const failureRate = rate(metrics.failure, metrics.totalRequests);
  const patterns = Array.isArray(infrastructureMemory.patterns)
    ? infrastructureMemory.patterns
    : [];

  if (metrics.p95Latency > 2000 || metrics.avgLatency > 1000) {
    recommendations.push({
      title: "Tail Latency Optimization",
      category: CATEGORIES.PERFORMANCE,
      reason: `Average latency is ${metrics.avgLatency}ms and p95 latency is ${metrics.p95Latency}ms.`,
      expectedImpact:
        "Lower p95 response time and reduce user-visible timeout risk.",
      priority: metrics.p95Latency > 3000 ? "critical" : "high",
      confidence: Math.min(95, 65 + Math.round(metrics.p95Latency / 100)),
    });
  }

  if (failureRate > 5) {
    recommendations.push({
      title: "Failure Escalation Remediation",
      category: CATEGORIES.RELIABILITY,
      reason: `${round(failureRate)}% of requests failed during this run.`,
      expectedImpact:
        "Improve reliability by isolating failing upstream or backend paths.",
      priority: failureRate > 15 ? "critical" : "high",
      confidence: Math.min(95, 70 + Math.round(failureRate)),
    });
  }

  if (metrics.rps > 100 && metrics.avgLatency > 500) {
    recommendations.push({
      title: "Increase Worker Count",
      category: CATEGORIES.SCALING,
      reason:
        "Throughput and latency indicate possible worker saturation under load.",
      expectedImpact:
        "Increase request processing capacity and reduce queue pressure.",
      priority: "high",
      confidence: 78,
    });
  }

  if (metrics.avgLatency > 800 && metrics.p95Latency > metrics.avgLatency * 2) {
    recommendations.push({
      title: "Redis Stabilization",
      category: CATEGORIES.INFRASTRUCTURE,
      reason:
        "Operational telemetry indicates elevated cache or queue pressure under distributed execution.",
      expectedImpact:
        "Reduces queue latency and improves infrastructure throughput stability.",
      priority: "high",
      confidence: 76,
    });
  }

  if (configurationSnapshot?.retryCount > 3 && metrics.failure > 0) {
    recommendations.push({
      title: "Reduce Retry Attempts",
      category: CATEGORIES.RETRY_STRATEGY,
      reason:
        "High retry counts can amplify traffic during dependency instability.",
      expectedImpact:
        "Reduce retry storms and protect workers during failure windows.",
      priority: "medium",
      confidence: 72,
    });
  }

  if (
    configurationSnapshot?.timeout < metrics.p95Latency &&
    metrics.p95Latency > 0
  ) {
    recommendations.push({
      title: "Increase Timeout",
      category: CATEGORIES.AVAILABILITY,
      reason:
        "Configured timeout is below observed p95 latency for this run.",
      expectedImpact:
        "Reduce avoidable client-side timeout failures under peak load.",
      priority: "medium",
      confidence: 76,
    });
  }

  if (metrics.packetLossInjected > 0 || metrics.connectionResetInjected > 0) {
    recommendations.push({
      title: "Network Resilience Hardening",
      category: CATEGORIES.NETWORKING,
      reason: "Chaos networking faults were injected during this run.",
      expectedImpact:
        "Improve resilience under packet loss and connection reset conditions.",
      priority: "high",
      confidence: 80,
    });
  }

  if (chaosReport?.enabled && chaosReport.metrics?.resilienceRate < 80) {
    recommendations.push({
      title: "Chaos Resilience Recovery",
      category: CATEGORIES.CHAOS,
      reason: `Chaos resilience rate is ${chaosReport.metrics.resilienceRate}%.`,
      expectedImpact:
        "Strengthen fallback policies and dependency isolation before increasing load.",
      priority: "critical",
      confidence: 85,
    });
  }

  if (risk?.level === "high" || risk?.level === "critical") {
    recommendations.push({
      title: "Preventive Stabilization",
      category: CATEGORIES.INFRASTRUCTURE,
      reason:
        "Predictive intelligence indicates elevated probability of infrastructure degradation.",
      expectedImpact:
        "Prevents cascading instability and reduces operational failure amplification.",
      priority: risk.level === "critical" ? "critical" : "high",
      confidence: risk.confidence || 80,
    });
  }

  patterns
    .filter((pattern) => ["high", "critical"].includes(pattern.severity))
    .slice(0, 2)
    .forEach((pattern) => {
      recommendations.push({
        title: pattern.title || "Dependency Instability",
        category: CATEGORIES.DEPENDENCIES,
        reason: `Recurring ${pattern.severity} infrastructure pattern detected ${pattern.detectionCount || 1} time(s).`,
        expectedImpact:
          pattern.recommendation ||
          "Reduce repeat incidents by addressing the recurring infrastructure pattern.",
        priority: pattern.severity === "critical" ? "critical" : "high",
        confidence: pattern.confidence || 70,
      });
    });

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Maintain Current Baseline",
      category: CATEGORIES.INFRASTRUCTURE,
      reason: `Risk level is ${risk?.level || "stable"} with stable core metrics.`,
      expectedImpact:
        "Preserve the current operating profile as a release comparison baseline.",
      priority: "low",
      confidence: 68,
    });
  }

  return recommendations;
};

module.exports = {
  buildRecommendations,
  CATEGORIES,
};
