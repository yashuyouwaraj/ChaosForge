const { getIncidentTimeline } = require("../../services/incidentTimeline");
const Run = require("../run/run.model");
const { buildRunIntelligence } = require("../intelligence/intelligence.service");
const {
  rate,
  round,
  titleCase,
} = require("../intelligence/utils/metrics.util");
const {
  buildRunConfigurationSnapshot,
} = require("../run/run.snapshot");

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
    status =
      resilienceRate >= 95
        ? "resilient"
        : resilienceRate >= 80
          ? "degraded"
          : "critical";
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

async function buildOperationalReport({ runId, projectId }) {
  const intelligence = await buildRunIntelligence({ projectId, runId });
  const savedRun = await Run.findOne({ projectId, runId });
  const metrics = intelligence.metrics;
  const overview = intelligence.overview;
  const configurationSnapshot =
    intelligence.configurationSnapshot || buildConfigurationSnapshot(savedRun);
  const incidentTimeline = buildIncidentTimeline({ runId, savedRun, metrics });
  const runMetrics = buildRunMetrics({
    runId,
    projectId,
    savedRun,
    metrics,
    overview,
  });
  const chaosReport = buildChaosReport({ savedRun, metrics, overview });

  return {
    generatedAt: intelligence.generatedAt,
    runId,
    projectId,
    executiveBrief: intelligence.executiveBrief,
    executiveSummary: intelligence.executiveSummary.text,
    healthScore: intelligence.healthScore,
    predictiveRisk: intelligence.predictiveRisk,
    rootCauseAnalysis: intelligence.rootCauseAnalysis,
    operationalInsights: intelligence.operationalInsights,
    infrastructureMemory: intelligence.infrastructureMemory,
    runMetrics,
    configurationSnapshot,
    chaosReport,
    deploymentReadiness: intelligence.deploymentReadiness,
    aiRecommendations: intelligence.aiRecommendations,
    historicalComparison: intelligence.historicalComparison,
    historicalIntelligence: intelligence.historicalIntelligence,
    incidentTimeline,
    intelligence,
    overview,
    errorTypes: metrics.errorTypes || {},
    rawMetrics: metrics,
  };
}

module.exports = {
  buildOperationalReport,
};
