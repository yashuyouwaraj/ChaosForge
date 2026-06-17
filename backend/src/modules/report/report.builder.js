const { getMetrics } = require("../../metrics/metrics.store");
const { getIncidentTimeline } = require("../../services/incidentTimeline");
const InfrastructureMemory = require("../memory/memory.model");
const Run = require("../run/run.model");

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const rate = (part, total) => {
  const safeTotal = toNumber(total);
  return safeTotal > 0 ? (toNumber(part) / safeTotal) * 100 : 0;
};

const round = (value, precision = 1) => {
  const factor = 10 ** precision;
  return Math.round(toNumber(value) * factor) / factor;
};

const normalizeMetrics = (savedRun, metrics = {}) => ({
  totalRequests: toNumber(savedRun?.totalRequests ?? metrics.totalRequests),
  success: toNumber(savedRun?.success ?? metrics.success),
  failure: toNumber(savedRun?.failure ?? metrics.failure),
  avgLatency: toNumber(savedRun?.avgLatency ?? metrics.avgLatency),
  p95Latency: toNumber(savedRun?.p95Latency ?? metrics.p95Latency),
  rps: toNumber(savedRun?.rps ?? metrics.rps),
  errorTypes: savedRun?.errorTypes || metrics.errorTypes || {},
  latencyBuckets: savedRun?.latencyBuckets || metrics.latencyBuckets || {},
  failureTimeline: savedRun?.failureTimeline || metrics.failureTimeline || [],
});

const getOverview = (metrics) => ({
  totalRequests: metrics.totalRequests || 0,
  success: metrics.success || 0,
  failure: metrics.failure || 0,
  avgLatency: metrics.avgLatency || 0,
  p95Latency: metrics.p95Latency || 0,
  rps: metrics.rps || 0,
});

const getErrorCount = (errorTypes = {}) =>
  Object.values(errorTypes).reduce((total, value) => total + toNumber(value), 0);

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

const buildHealthScore = (metrics) => {
  const failureRate = rate(metrics.failure, metrics.totalRequests);
  const errorCount = getErrorCount(metrics.errorTypes);
  let score = 100;

  if (failureRate > 20) {
    score -= 30;
  } else if (failureRate > 10) {
    score -= 20;
  } else if (failureRate > 5) {
    score -= 10;
  } else if (failureRate > 0) {
    score -= 5;
  }

  if (metrics.avgLatency > 2000) {
    score -= 20;
  } else if (metrics.avgLatency > 1000) {
    score -= 15;
  } else if (metrics.avgLatency > 500) {
    score -= 8;
  }

  if (metrics.p95Latency > 3000) {
    score -= 20;
  } else if (metrics.p95Latency > 2000) {
    score -= 15;
  } else if (metrics.p95Latency > 1000) {
    score -= 8;
  }

  if (errorCount > 0) {
    score -= Math.min(20, Math.ceil(errorCount / 5) * 5);
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    status: getHealthStatus(score),
  };
};

const buildPredictiveRisk = (metrics) => {
  const failureRate = rate(metrics.failure, metrics.totalRequests);
  let risk = 10;

  if (failureRate > 20) {
    risk += 35;
  } else if (failureRate > 10) {
    risk += 25;
  } else if (failureRate > 5) {
    risk += 15;
  } else if (failureRate > 0) {
    risk += 8;
  }

  if (metrics.p95Latency > 3000) {
    risk += 25;
  } else if (metrics.p95Latency > 2000) {
    risk += 20;
  } else if (metrics.p95Latency > 1000) {
    risk += 10;
  }

  if (metrics.avgLatency > 1000) {
    risk += 15;
  }

  if (metrics.totalRequests > 0 && metrics.rps < 10) {
    risk += 10;
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

  return {
    level,
    risk,
    forecast,
  };
};

const buildRootCauseAnalysis = (metrics, infrastructureMemory) => {
  const causes = [];
  const failureRate = rate(metrics.failure, metrics.totalRequests);

  if (failureRate > 0) {
    causes.push({
      title: "Request Failure Escalation",
      confidence: Math.min(95, 60 + Math.round(failureRate)),
      evidence: `${round(failureRate)}% failure rate across ${metrics.totalRequests} requests.`,
      recommendation:
        "Inspect upstream service responses, retry behavior, and dependency availability.",
    });
  }

  if (metrics.p95Latency > 1000) {
    causes.push({
      title: "Tail Latency Amplification",
      confidence: Math.min(95, 65 + Math.round(metrics.p95Latency / 100)),
      evidence: `P95 latency reached ${metrics.p95Latency}ms.`,
      recommendation:
        "Review slow endpoints, worker saturation, queue depth, and backend processing time.",
    });
  }

  if (metrics.avgLatency > 500 && metrics.rps > 50) {
    causes.push({
      title: "Infrastructure Saturation",
      confidence: Math.min(90, 60 + Math.round(metrics.rps / 10)),
      evidence: `${metrics.rps} RPS with ${metrics.avgLatency}ms average latency.`,
      recommendation:
        "Scale worker capacity and reduce contention in request processing paths.",
    });
  }

  infrastructureMemory.patterns
    .filter((pattern) => ["high", "critical"].includes(pattern.severity))
    .forEach((pattern) => {
      causes.push({
        title: pattern.title || "Recurring Infrastructure Pattern",
        confidence: pattern.confidence || 70,
        evidence: `Historical ${pattern.severity} pattern observed ${pattern.detectionCount || 1} time(s).`,
        recommendation:
          pattern.recommendation ||
          "Review recurring infrastructure behavior before the next load run.",
      });
    });

  return causes.sort((a, b) => toNumber(b.confidence) - toNumber(a.confidence));
};

const buildOperationalInsights = (metrics, infrastructureMemory) => {
  const insights = [];
  const failureRate = rate(metrics.failure, metrics.totalRequests);

  if (metrics.p95Latency > metrics.avgLatency * 2 && metrics.p95Latency > 0) {
    insights.push({
      severity: "warning",
      title: "Tail Latency Spread",
      description:
        "P95 latency is materially higher than average latency, indicating uneven response behavior.",
    });
  }

  if (failureRate > 0) {
    insights.push({
      severity: failureRate > 10 ? "critical" : "warning",
      title: "Failure Rate Detected",
      description: `${round(failureRate)}% of requests failed during this run.`,
    });
  }

  if (metrics.rps < 30 && metrics.totalRequests > 0) {
    insights.push({
      severity: "info",
      title: "Low Throughput",
      description:
        "Observed throughput is low relative to typical stress-test targets.",
    });
  } else if (metrics.rps >= 30) {
    insights.push({
      severity: "info",
      title: "Throughput Sustained",
      description: `The run sustained approximately ${metrics.rps} requests per second.`,
    });
  }

  if (infrastructureMemory.totalPatterns > 0) {
    insights.push({
      severity: "warning",
      title: "Historical Patterns Present",
      description: `${infrastructureMemory.totalPatterns} infrastructure memory pattern(s) exist for this project.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      severity: "info",
      title: "Stable Execution",
      description:
        "No significant latency, failure, throughput, or memory-pattern risks were detected.",
    });
  }

  return insights;
};

const buildExecutiveBrief = ({
  healthScore,
  predictiveRisk,
  overview,
  failureRate,
}) =>
  `Run health is ${healthScore.status} at ${healthScore.score}/100 with ${predictiveRisk.level} predictive risk. The run processed ${overview.totalRequests} requests, recorded ${overview.failure} failures (${round(failureRate)}%), and reached ${overview.avgLatency}ms average latency with ${overview.p95Latency}ms p95 latency.`;

const buildExecutiveSummary = ({
  healthScore,
  predictiveRisk,
  overview,
  failureRate,
  infrastructureMemory,
}) =>
  `ChaosForge evaluated this run as ${healthScore.status} with a health score of ${healthScore.score}/100. The simulation processed ${overview.totalRequests} total requests at approximately ${overview.rps} RPS, with ${overview.success} successful responses and ${overview.failure} failures for a ${round(failureRate)}% failure rate. Latency averaged ${overview.avgLatency}ms while p95 latency reached ${overview.p95Latency}ms, producing a ${predictiveRisk.level} risk forecast: ${predictiveRisk.forecast} Infrastructure memory contributed ${infrastructureMemory.totalPatterns} historical pattern(s) for operational context.`;

const buildInfrastructureMemory = async (projectId) => {
  const memory = await InfrastructureMemory.find({ projectId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  const patterns = memory.map((pattern) => ({
    title: pattern.title,
    severity: pattern.severity,
    confidence: pattern.confidence,
    detectionCount: pattern.detectionCount,
    trend: pattern.trend,
    recommendation: pattern.recommendation,
  }));

  return {
    totalPatterns: patterns.length,
    patterns,
  };
};

const buildIncidentTimeline = (runId) =>
  getIncidentTimeline()
    .filter((incident) => incident?.metadata?.runId === runId)
    .map((incident) => ({
      title: incident.title,
      severity: incident.severity,
      timestamp: incident.timestamp,
      message: incident.message,
    }));

const buildRunMetrics = ({ runId, projectId, savedRun, metrics, overview }) => ({
  runId,
  projectId,
  status: savedRun?.status,
  url: savedRun?.url,
  config: savedRun?.config || {},
  createdAt: savedRun?.createdAt,
  totalRequests: overview.totalRequests,
  success: overview.success,
  failure: overview.failure,
  successRate: round(rate(overview.success, overview.totalRequests)),
  failureRate: round(rate(overview.failure, overview.totalRequests)),
  avgLatency: overview.avgLatency,
  p95Latency: overview.p95Latency,
  rps: overview.rps,
  latencyBuckets: metrics.latencyBuckets || {},
  failureTimeline: metrics.failureTimeline || [],
});

async function buildOperationalReport({ runId, projectId }) {
  // First, try to fetch from MongoDB (saved run data)
  const savedRun = await Run.findOne({ projectId, runId }); 
  const hasSavedMetrics = savedRun && savedRun.totalRequests > 0;

  let metrics;

  if (hasSavedMetrics) {
    // Use MongoDB data if available
    metrics = {
      totalRequests: savedRun.totalRequests || 0,
      success: savedRun.success || 0,
      failure: savedRun.failure || 0,
      avgLatency: savedRun.avgLatency || 0,
      p95Latency: savedRun.p95Latency || 0,
      rps: savedRun.rps || 0,
      errorTypes: savedRun.errorTypes || {},
      latencyBuckets: savedRun.latencyBuckets || {},
      failureTimeline: savedRun.failureTimeline || [],
    };
  } else {
    // Fallback to Redis if run not saved yet
    metrics = await getMetrics(projectId, runId);
  }

  metrics = normalizeMetrics(hasSavedMetrics ? savedRun : null, metrics);

  const overview = getOverview(metrics);
  const failureRate = rate(overview.failure, overview.totalRequests);
  const infrastructureMemory = await buildInfrastructureMemory(projectId);
  const healthScore = buildHealthScore(metrics);
  const predictiveRisk = buildPredictiveRisk(metrics);
  const rootCauseAnalysis = buildRootCauseAnalysis(
    metrics,
    infrastructureMemory,
  );
  const operationalInsights = buildOperationalInsights(
    metrics,
    infrastructureMemory,
  );
  const incidentTimeline = buildIncidentTimeline(runId);
  const runMetrics = buildRunMetrics({
    runId,
    projectId,
    savedRun,
    metrics,
    overview,
  });

  return {
    generatedAt: new Date().toISOString(),

    runId,

    projectId,

    executiveBrief: buildExecutiveBrief({
      healthScore,
      predictiveRisk,
      overview,
      failureRate,
    }),

    executiveSummary: buildExecutiveSummary({
      healthScore,
      predictiveRisk,
      overview,
      failureRate,
      infrastructureMemory,
    }),

    healthScore,

    predictiveRisk,

    rootCauseAnalysis,

    operationalInsights,

    infrastructureMemory,

    runMetrics,

    incidentTimeline,

    // Backward compatibility for existing PDF/CSV renderers.
    overview,

    errorTypes: metrics.errorTypes || {},

    rawMetrics: metrics,
  };
}

module.exports = {
  buildOperationalReport,
};
