const { getMetrics } = require("../../metrics/metrics.store");
const { getIncidentTimeline } = require("../../services/incidentTimeline");
const InfrastructureMemory = require("../memory/memory.model");
const Run = require("../run/run.model");
const {
  buildRunConfigurationSnapshot,
} = require("../run/run.snapshot");

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

const titleCase = (value = "") =>
  String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const preferNonEmptyArray = (...values) => {
  const firstNonEmpty = values.find(
    (value) => Array.isArray(value) && value.length > 0,
  );

  return firstNonEmpty || [];
};

const normalizeMetrics = (savedRun, metrics = {}) => ({
  totalRequests: toNumber(savedRun?.totalRequests ?? metrics.totalRequests),
  success: toNumber(savedRun?.success ?? metrics.success),
  failure: toNumber(savedRun?.failure ?? metrics.failure),
  avgLatency: toNumber(savedRun?.avgLatency ?? metrics.avgLatency),
  p95Latency: toNumber(savedRun?.p95Latency ?? metrics.p95Latency),
  rps: toNumber(savedRun?.rps ?? metrics.rps),
  errorTypes: savedRun?.errorTypes || metrics.errorTypes || {},
  latencyTimeline: preferNonEmptyArray(
    savedRun?.latencyTimeline,
    metrics.latencyTimeline,
  ),
  latencyBuckets: savedRun?.latencyBuckets || metrics.latencyBuckets || {},
  failureTimeline: preferNonEmptyArray(
    savedRun?.failureTimeline,
    metrics.failureTimeline,
  ),
  chaosInjected: toNumber(savedRun?.chaosInjected ?? metrics.chaosInjected),
  chaosSuccess: toNumber(savedRun?.chaosSuccess ?? metrics.chaosSuccess),
  chaosFailure: toNumber(savedRun?.chaosFailure ?? metrics.chaosFailure),
  latencyInjected: toNumber(
    savedRun?.latencyInjected ?? metrics.latencyInjected,
  ),
  failureInjected: toNumber(
    savedRun?.failureInjected ?? metrics.failureInjected,
  ),
  timeoutInjected: toNumber(
    savedRun?.timeoutInjected ?? metrics.timeoutInjected,
  ),
  packetLossInjected: toNumber(
    savedRun?.packetLossInjected ?? metrics.packetLossInjected,
  ),
  connectionResetInjected: toNumber(
    savedRun?.connectionResetInjected ?? metrics.connectionResetInjected,
  ),
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

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const buildDeploymentReadiness = ({
  metrics,
  healthScore,
  predictiveRisk,
  chaosReport,
}) => {
  const failureRate = rate(metrics.failure, metrics.totalRequests);
  const successRate = rate(metrics.success, metrics.totalRequests);
  const resilienceRate = chaosReport.metrics?.resilienceRate || 0;

  return {
    availability: clampScore(successRate || 100),
    reliability: clampScore(100 - failureRate * 2),
    performance: clampScore(
      100 -
        (metrics.avgLatency > 500 ? (metrics.avgLatency - 500) / 30 : 0) -
        (metrics.p95Latency > 1000 ? (metrics.p95Latency - 1000) / 40 : 0),
    ),
    resilience: clampScore(
      chaosReport.enabled
        ? resilienceRate || 75
        : Math.max(55, healthScore.score - 10),
    ),
    observability: clampScore(
      65 +
        (metrics.latencyTimeline?.length > 0 ? 15 : 0) +
        (metrics.failureTimeline?.length > 0 ? 10 : 0) +
        (metrics.latencyBuckets ? 10 : 0),
    ),
    overall: clampScore(
      (healthScore.score + (100 - predictiveRisk.risk) + (successRate || 100)) /
        3,
    ),
  };
};

const buildConfigurationSnapshot = (savedRun) => {
  if (!savedRun) {
    return null;
  }

  return (
    savedRun.configurationSnapshot ||
    buildRunConfigurationSnapshot({
      config: savedRun.config || {},
      chaosConfig: savedRun.chaosConfig || null,
      url: savedRun.url,
    })
  );
};

const buildAiRecommendations = ({
  metrics,
  predictiveRisk,
  infrastructureMemory,
  configurationSnapshot,
}) => {
  const recommendations = [];
  const failureRate = rate(metrics.failure, metrics.totalRequests);

  if (metrics.p95Latency > 2000 || metrics.avgLatency > 1000) {
    recommendations.push({
      title: "Tail Latency Increasing",
      reason: `Average latency is ${metrics.avgLatency}ms and p95 latency is ${metrics.p95Latency}ms.`,
      expectedImpact:
        "Lower p95 response time and reduce user-visible timeout risk.",
      priority: metrics.p95Latency > 3000 ? "critical" : "high",
      confidence: Math.min(95, 65 + Math.round(metrics.p95Latency / 100)),
    });
  }

  if (failureRate > 5) {
    recommendations.push({
      title: "Failure Escalation Trend",
      reason: `${round(failureRate)}% of requests failed during this run.`,
      expectedImpact:
        "Improve reliability by isolating failing upstream or backend paths.",
      priority: failureRate > 15 ? "critical" : "high",
      confidence: Math.min(95, 70 + Math.round(failureRate)),
    });
  }

  if (configurationSnapshot?.retryCount > 3 && metrics.failure > 0) {
    recommendations.push({
      title: "Reduce Retry Attempts",
      reason:
        "High retry counts can amplify traffic during dependency instability.",
      expectedImpact:
        "Reduce retry storms and protect workers during failure windows.",
      priority: "medium",
      confidence: 72,
    });
  }

  if (configurationSnapshot?.timeout < metrics.p95Latency && metrics.p95Latency > 0) {
    recommendations.push({
      title: "Increase Timeout",
      reason:
        "Configured timeout is below observed p95 latency for this run.",
      expectedImpact:
        "Reduce avoidable client-side timeout failures under peak load.",
      priority: "medium",
      confidence: 76,
    });
  }

  if (metrics.rps > 100 && metrics.avgLatency > 500) {
    recommendations.push({
      title: "Increase Worker Count",
      reason:
        "Throughput and latency indicate possible worker saturation under load.",
      expectedImpact:
        "Increase request processing capacity and reduce queue pressure.",
      priority: "high",
      confidence: 78,
    });
  }

  infrastructureMemory.patterns
    .filter((pattern) => ["high", "critical"].includes(pattern.severity))
    .slice(0, 2)
    .forEach((pattern) => {
      recommendations.push({
        title: pattern.title || "Dependency Instability",
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
      reason: `Risk level is ${predictiveRisk.level} with stable core metrics.`,
      expectedImpact:
        "Preserve the current operating profile as a release comparison baseline.",
      priority: "low",
      confidence: 68,
    });
  }

  return recommendations;
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
    patternType: pattern.patternType,
    severity: pattern.severity,
    confidence: pattern.confidence,
    detectionCount: pattern.detectionCount,
    firstDetectedAt: pattern.firstDetectedAt,
    lastDetectedAt: pattern.lastDetectedAt,
    trend: pattern.trend,
    recommendation: pattern.recommendation,
  }));

  return {
    totalPatterns: patterns.length,
    patterns,
  };
};

const getLatestMetricTime = (metrics) => {
  const timelineTimes = [
    ...(Array.isArray(metrics.latencyTimeline)
      ? metrics.latencyTimeline.map((point) => point.time)
      : []),
    ...(Array.isArray(metrics.failureTimeline)
      ? metrics.failureTimeline.map((point) => point.time)
      : []),
  ]
    .map(Number)
    .filter(Number.isFinite);

  if (timelineTimes.length === 0) {
    return null;
  }

  return new Date(Math.max(...timelineTimes)).toISOString();
};

const buildLifecycleTimeline = ({ runId, savedRun, metrics }) => {
  const incidents = [];
  const startedAt = savedRun?.createdAt;
  const completedAt =
    savedRun?.completedAt ||
    getLatestMetricTime(metrics) ||
    savedRun?.updatedAt;

  if (startedAt) {
    incidents.push({
      title: "Simulation Started",
      severity: "info",
      timestamp: new Date(startedAt).toISOString(),
      message: `Run ${runId} started.`,
      type: "simulation",
    });
  }

  if (["completed", "stopped"].includes(savedRun?.status) && completedAt) {
    incidents.push({
      title: "Simulation Completed",
      severity: savedRun.status === "stopped" ? "warning" : "info",
      timestamp: new Date(completedAt).toISOString(),
      message:
        savedRun.status === "stopped"
          ? `Run ${runId} was stopped before completion.`
          : `Run ${runId} completed successfully.`,
      type: "simulation",
    });
  }

  if (savedRun?.status === "failed") {
    incidents.push({
      title: "Simulation Failed",
      severity: "critical",
      timestamp: new Date(completedAt || startedAt || Date.now()).toISOString(),
      message: `Run ${runId} failed.`,
      type: "simulation",
    });
  }

  return incidents;
};

const buildIncidentTimeline = ({ runId, savedRun, metrics }) => {
  const seen = new Set();

  const liveIncidents = getIncidentTimeline()
    .filter((incident) => incident?.metadata?.runId === runId)
    .map((incident) => ({
      title: incident.title,
      severity: incident.severity,
      timestamp: incident.timestamp,
      message: incident.message,
      type: incident.type,
    }));

  return [...liveIncidents, ...buildLifecycleTimeline({ runId, savedRun, metrics })]
    .filter((incident) => {
      const key = [
        incident.title,
        incident.message,
        incident.severity,
        incident.type,
      ].join("|");

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
};

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
  latencyTimeline: metrics.latencyTimeline || [],
  latencyBuckets: metrics.latencyBuckets || {},
  failureTimeline: metrics.failureTimeline || [],
  chaosConfig: savedRun?.chaosConfig || null,
  chaosInjected: metrics.chaosInjected,
  chaosSuccess: metrics.chaosSuccess,
  chaosFailure: metrics.chaosFailure,
  latencyInjected: metrics.latencyInjected,
  failureInjected: metrics.failureInjected,
  timeoutInjected: metrics.timeoutInjected,
  packetLossInjected: metrics.packetLossInjected,
  connectionResetInjected: metrics.connectionResetInjected,
});

const getEnabledFaults = (configuration = {}) => {
  const faults = [];

  if (configuration.latency?.enabled) {
    faults.push(
      `Latency ${configuration.latency.min || 0}-${configuration.latency.max || 0}ms at ${configuration.latency.percentage || 0}%`,
    );
  }

  if (configuration.statusCode?.enabled || configuration.failureRate > 0) {
    faults.push(`HTTP failures at ${configuration.failureRate || 0}%`);
  }

  if (configuration.timeout?.enabled) {
    faults.push(
      `Timeout ${configuration.timeout.duration || 0}ms at ${configuration.timeout.percentage || 0}%`,
    );
  }

  if (configuration.packetLoss?.enabled) {
    faults.push(`Packet loss at ${configuration.packetLoss.percentage || 0}%`);
  }

  if (configuration.connectionReset?.enabled) {
    faults.push(
      `Connection reset at ${configuration.connectionReset.percentage || 0}%`,
    );
  }

  return faults;
};

const buildFaultBreakdown = (metrics) => [
  {
    type: "latency",
    label: "Latency",
    injected: metrics.latencyInjected,
  },
  {
    type: "failure",
    label: "Failure",
    injected: metrics.failureInjected,
  },
  {
    type: "timeout",
    label: "Timeout",
    injected: metrics.timeoutInjected,
  },
  {
    type: "packet_loss",
    label: "Packet Loss",
    injected: metrics.packetLossInjected,
  },
  {
    type: "connection_reset",
    label: "Connection Reset",
    injected: metrics.connectionResetInjected,
  },
];

const buildChaosRecommendations = ({
  configuration,
  totalInjected,
  resilienceRate,
  failedInjections,
  overview,
}) => {
  if (!configuration?.enabled) {
    return [
      "Enable a controlled Chaos profile before the next resilience validation run.",
    ];
  }

  if (totalInjected === 0) {
    return [
      "Increase traffic volume or configured injection percentages so faults are exercised during the run.",
      "Re-run the experiment and confirm the incident timeline records injected fault behavior.",
    ];
  }

  const recommendations = [];

  if (resilienceRate < 80) {
    recommendations.push(
      "Treat this run as a critical resilience regression and review dependency fallbacks before increasing load.",
    );
  } else if (resilienceRate < 95) {
    recommendations.push(
      "Review affected request paths and strengthen retry plus timeout and fallback policies.",
    );
  } else {
    recommendations.push(
      "Preserve this configuration as a resilience baseline for future release comparisons.",
    );
  }

  if (failedInjections > 0) {
    recommendations.push(
      "Correlate failed injected requests with application logs and infrastructure memory patterns.",
    );
  }

  if (overview.p95Latency > 1000) {
    recommendations.push(
      "Investigate tail latency during fault windows before approving higher concurrency.",
    );
  }

  return recommendations;
};

const buildChaosReport = ({ savedRun, metrics, overview }) => {
  const configuration = savedRun?.chaosConfig || null;
  const totalInjected = metrics.chaosInjected;
  const successfulInjections = metrics.chaosSuccess;
  const failedInjections = metrics.chaosFailure;
  const injectionRate = round(rate(totalInjected, overview.totalRequests));
  const resilienceRate = round(rate(successfulInjections, totalInjected));
  const failureContributionRate = round(
    rate(failedInjections, overview.failure),
  );

  const faultBreakdown = buildFaultBreakdown(metrics);
  const enabledFaults = getEnabledFaults(configuration || {});
  let status = "not_exercised";
  let summary = "Chaos Engineering was disabled for this run.";

  if (!configuration) {
    status = "unavailable";
    summary = "This run predates Chaos configuration snapshots.";
  } else if (configuration.enabled && totalInjected === 0) {
    status = "not_triggered";
    summary =
      "Chaos Engineering was enabled, but no fault was injected during this run.";
  } else if (totalInjected > 0) {
    status = resilienceRate >= 95 ? "resilient" : resilienceRate >= 80 ? "degraded" : "critical";
    summary = `${successfulInjections} of ${totalInjected} fault-injected requests completed successfully.`;
  }

  return {
    enabled: Boolean(configuration?.enabled),
    profile: configuration?.profile || "custom",
    configuration,
    enabledFaults,
    faultBreakdown,
    metrics: {
      totalInjected,
      successfulInjections,
      failedInjections,
      injectionRate,
      resilienceRate,
      failureContributionRate,
      latencyInjected: metrics.latencyInjected,
      failureInjected: metrics.failureInjected,
      timeoutInjected: metrics.timeoutInjected,
      packetLossInjected: metrics.packetLossInjected,
      connectionResetInjected: metrics.connectionResetInjected,
    },
    assessment: {
      status,
      label: titleCase(status),
      summary,
      evidence: [
        `${totalInjected} fault-injected request(s) observed.`,
        `${round(resilienceRate)}% resilience rate across injected traffic.`,
        `${round(failureContributionRate)}% of run failures came from chaos-injected requests.`,
      ],
      recommendations: buildChaosRecommendations({
        configuration,
        totalInjected,
        resilienceRate,
        failedInjections,
        overview,
      }),
    },
  };
};

const compareValue = (current, previous, lowerIsBetter = false) => {
  if (!previous && previous !== 0) {
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

const buildHistoricalComparison = async ({ projectId, runId, savedRun }) => {
  if (!savedRun?.createdAt) {
    return {
      hasPreviousRun: false,
      metrics: {},
    };
  }

  const previousRun = await Run.findOne({
    projectId,
    runId: { $ne: runId },
    createdAt: { $lt: savedRun.createdAt },
    totalRequests: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!previousRun) {
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
  const currentHealth = buildHealthScore(savedRun).score;
  const previousHealth = buildHealthScore(previousRun).score;

  return {
    hasPreviousRun: true,
    previousRunId: previousRun.runId,
    metrics: {
      latency: compareValue(savedRun.avgLatency || 0, previousRun.avgLatency || 0, true),
      p95: compareValue(savedRun.p95Latency || 0, previousRun.p95Latency || 0, true),
      failureRate: compareValue(currentFailureRate, previousFailureRate, true),
      rps: compareValue(savedRun.rps || 0, previousRun.rps || 0),
      healthScore: compareValue(currentHealth, previousHealth),
      successRate: compareValue(currentSuccessRate, previousSuccessRate),
    },
  };
};

const buildHistoricalIntelligence = (infrastructureMemory = {}) => {
  const patterns = Array.isArray(infrastructureMemory.patterns)
    ? infrastructureMemory.patterns
    : [];

  return {
    recurringIssues: patterns.map((pattern) => ({
      title: pattern.title || "Infrastructure Pattern",
      trendDirection: pattern.trend || "stable",
      firstSeen: pattern.firstDetectedAt || null,
      lastSeen: pattern.lastDetectedAt || null,
      detectionCount: pattern.detectionCount || 0,
      riskEvolution:
        pattern.trend === "worsening"
          ? "Regressed"
          : pattern.trend === "improving"
            ? "Improved"
            : "Stable",
      confidence: pattern.confidence || 0,
      recommendation:
        pattern.recommendation ||
        "Continue monitoring this pattern across future runs.",
    })),
  };
};

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
      latencyTimeline: savedRun.latencyTimeline || [],
      latencyBuckets: savedRun.latencyBuckets || {},
      failureTimeline: savedRun.failureTimeline || [],
      chaosInjected: savedRun.chaosInjected || 0,
      chaosSuccess: savedRun.chaosSuccess || 0,
      chaosFailure: savedRun.chaosFailure || 0,
      latencyInjected: savedRun.latencyInjected || 0,
      failureInjected: savedRun.failureInjected || 0,
      timeoutInjected: savedRun.timeoutInjected || 0,
      packetLossInjected: savedRun.packetLossInjected || 0,
      connectionResetInjected: savedRun.connectionResetInjected || 0,
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
  const incidentTimeline = buildIncidentTimeline({ runId, savedRun, metrics });
  const configurationSnapshot = buildConfigurationSnapshot(savedRun);
  const runMetrics = buildRunMetrics({
    runId,
    projectId,
    savedRun,
    metrics,
    overview,
  });
  const chaosReport = buildChaosReport({ savedRun, metrics, overview });
  const deploymentReadiness = buildDeploymentReadiness({
    metrics,
    healthScore,
    predictiveRisk,
    chaosReport,
  });
  const aiRecommendations = buildAiRecommendations({
    metrics,
    predictiveRisk,
    infrastructureMemory,
    configurationSnapshot,
  });
  const historicalComparison = await buildHistoricalComparison({
    projectId,
    runId,
    savedRun,
  });
  const historicalIntelligence =
    buildHistoricalIntelligence(infrastructureMemory);

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

    configurationSnapshot,

    chaosReport,

    deploymentReadiness,

    aiRecommendations,

    historicalComparison,

    historicalIntelligence,

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
