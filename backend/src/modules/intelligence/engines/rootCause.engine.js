const { rate, round } = require("../utils/metrics.util");

const severityFromConfidence = (confidence) => {
  if (confidence >= 90) {
    return "critical";
  }

  if (confidence >= 75) {
    return "high";
  }

  if (confidence >= 60) {
    return "moderate";
  }

  return "info";
};

const pushCause = (causes, cause) => {
  causes.push({
    severity: cause.severity || severityFromConfidence(cause.confidence),
    ...cause,
  });
};

/**
 * Canonical root cause engine.
 */
const buildRootCause = (metrics, infrastructureMemory = {}) => {
  const causes = [];
  const failureRate = rate(metrics.failure, metrics.totalRequests);
  const patterns = Array.isArray(infrastructureMemory.patterns)
    ? infrastructureMemory.patterns
    : [];

  if (metrics.avgLatency > 500) {
    pushCause(causes, {
      title: "Latency Degradation",
      confidence: Math.min(92, 60 + Math.round(metrics.avgLatency / 50)),
      evidence: `Average latency reached ${metrics.avgLatency}ms during execution.`,
      recommendation:
        "Optimize backend response times, database queries, and request processing paths.",
    });
  }

  if (metrics.p95Latency > 1000) {
    pushCause(causes, {
      title: "Tail Latency Amplification",
      confidence: Math.min(95, 65 + Math.round(metrics.p95Latency / 100)),
      evidence: `P95 latency reached ${metrics.p95Latency}ms.`,
      recommendation:
        "Review slow endpoints, worker saturation, queue depth, and backend processing time.",
    });
  }

  if (failureRate > 0) {
    pushCause(causes, {
      title: "Failure Rate Escalation",
      confidence: Math.min(95, 60 + Math.round(failureRate)),
      evidence: `${round(failureRate)}% failure rate across ${metrics.totalRequests} requests.`,
      recommendation:
        "Inspect upstream service responses, retry behavior, and dependency availability.",
    });
  }

  if (metrics.packetLossInjected > 0) {
    pushCause(causes, {
      title: "Packet Loss",
      confidence: 82,
      evidence: `${metrics.packetLossInjected} packet-loss fault(s) were injected during the run.`,
      recommendation:
        "Validate retry budgets and network resilience during lossy conditions.",
    });
  }

  if (metrics.timeoutInjected > 0) {
    pushCause(causes, {
      title: "Timeout Injection Impact",
      confidence: 80,
      evidence: `${metrics.timeoutInjected} timeout injection(s) were recorded.`,
      recommendation:
        "Tune timeout limits and verify downstream service response windows.",
    });
  }

  if (metrics.connectionResetInjected > 0) {
    pushCause(causes, {
      title: "Connection Reset",
      confidence: 81,
      evidence: `${metrics.connectionResetInjected} connection reset fault(s) were injected.`,
      recommendation:
        "Review connection pooling, keep-alive settings, and upstream stability.",
    });
  }

  if (metrics.avgLatency > 500 && metrics.rps > 50) {
    pushCause(causes, {
      title: "Infrastructure Saturation",
      confidence: Math.min(90, 60 + Math.round(metrics.rps / 10)),
      evidence: `${metrics.rps} RPS with ${metrics.avgLatency}ms average latency.`,
      recommendation:
        "Scale worker capacity and reduce contention in request processing paths.",
    });
  }

  if (metrics.avgLatency > 1000 && metrics.rps >= 100) {
    pushCause(causes, {
      title: "Worker Saturation",
      confidence: Math.min(93, 70 + Math.round(metrics.avgLatency / 100)),
      evidence: `High concurrency (${metrics.rps} RPS) with ${metrics.avgLatency}ms average latency.`,
      recommendation:
        "Increase worker concurrency, rebalance traffic, and inspect queue backlog.",
    });
  }

  if (
    metrics.avgLatency > 800 &&
    metrics.p95Latency > metrics.avgLatency * 2.5
  ) {
    pushCause(causes, {
      title: "Redis Pressure",
      confidence: 78,
      evidence:
        "Elevated average latency with disproportionate tail latency suggests cache or queue pressure.",
      recommendation:
        "Check Redis memory utilization, connection pooling, and persistence configuration.",
    });
  }

  patterns
    .filter((pattern) => ["high", "critical"].includes(pattern.severity))
    .forEach((pattern) => {
      pushCause(causes, {
        title: pattern.title || "Recurring Historical Pattern",
        confidence: pattern.confidence || 70,
        evidence: `Historical ${pattern.severity} pattern "${pattern.title}" observed ${pattern.detectionCount || 1} time(s).`,
        recommendation:
          pattern.recommendation ||
          "Review recurring infrastructure behavior before the next load run.",
      });
    });

  if (causes.length === 0) {
    pushCause(causes, {
      title: "No Dominant Failure Source",
      confidence: 68,
      severity: "info",
      evidence: "Failure and latency signals remained within stable thresholds.",
      recommendation:
        "Use this run as a baseline for future release and chaos comparisons.",
    });
  }

  return causes.sort((a, b) => b.confidence - a.confidence);
};

module.exports = {
  buildRootCause,
};
