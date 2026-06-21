const Run = require("../run/run.model");
const { buildHealth } = require("./engines/health.engine");
const { buildRisk } = require("./engines/risk.engine");
const { buildRootCause } = require("./engines/rootCause.engine");
const { buildRecommendations } = require("./engines/recommendation.engine");
const {
  buildTrends,
  buildHistoricalComparison,
  buildHistoricalIntelligence,
} = require("./engines/trend.engine");
const { buildDeploymentReadiness } = require("./engines/deploymentReadiness.engine");
const { buildOperationalInsights } = require("./engines/operationalInsights.engine");
const {
  buildExecutiveBrief,
  buildExecutiveSummary,
} = require("./engines/executive.engine");
const { buildInfrastructureHealth } = require("./engines/infrastructureHealth.engine");
const { buildResilience } = require("./engines/resilience.engine");
const { loadInfrastructureMemory } = require("./engines/memory.engine");
const {
  normalizeMetrics,
  getOverview,
  rate,
} = require("./utils/metrics.util");
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

const buildMinimalChaosReport = (savedRun, metrics) => {
  const configuration = savedRun?.chaosConfig || null;
  const totalInjected = metrics.chaosInjected || 0;
  const successfulInjections = metrics.chaosSuccess || 0;
  const resilienceRate =
    totalInjected > 0
      ? Math.round((successfulInjections / totalInjected) * 1000) / 10
      : 0;

  return {
    enabled: Boolean(configuration?.enabled),
    configuration,
    metrics: {
      totalInjected,
      successfulInjections,
      failedInjections: metrics.chaosFailure || 0,
      resilienceRate,
    },
    assessment: {
      summary:
        totalInjected > 0
          ? `${successfulInjections} of ${totalInjected} fault-injected requests completed successfully.`
          : configuration?.enabled
            ? "Chaos Engineering was enabled, but no fault was injected during this run."
            : "Chaos Engineering was disabled for this run.",
    },
  };
};

const loadRunContext = async ({ projectId, runId }) => {
  const savedRun = await Run.findOne({ projectId, runId }).lean();
  const hasSavedMetrics = savedRun && savedRun.totalRequests > 0;

  let metrics;

  if (hasSavedMetrics) {
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
    const { getMetrics } = require("../../metrics/metrics.store");
    metrics = await getMetrics(projectId, runId);
  }

  metrics = normalizeMetrics(hasSavedMetrics ? savedRun : null, metrics);

  const historicalRuns = await Run.find({
    projectId,
    runId: { $ne: runId },
    totalRequests: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  let previousRun = null;

  if (savedRun?.createdAt) {
    previousRun = await Run.findOne({
      projectId,
      runId: { $ne: runId },
      createdAt: { $lt: savedRun.createdAt },
      totalRequests: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .lean();
  } else if (historicalRuns.length > 0) {
    previousRun = historicalRuns[0];
  }

  return {
    savedRun,
    metrics,
    previousRun,
    historicalRuns,
  };
};

const computeRunIntelligence = async ({
  projectId,
  runId,
  savedRun,
  metrics,
  previousRun,
  historicalRuns,
  infrastructureMemory,
}) => {
  const normalizedMetrics = normalizeMetrics(
    savedRun && savedRun.totalRequests > 0 ? savedRun : null,
    metrics,
  );

  const overview = getOverview(normalizedMetrics);
  const failureRate = rate(overview.failure, overview.totalRequests);
  const configurationSnapshot = buildConfigurationSnapshot(savedRun);
  const chaosReport = buildMinimalChaosReport(savedRun, normalizedMetrics);

  const historicalComparison = buildHistoricalComparison({
    savedRun: savedRun || normalizedMetrics,
    previousRun,
  });

  const healthTrend =
    historicalComparison.metrics?.healthScore?.trend || "Stable";

  const health = buildHealth(normalizedMetrics, healthTrend);
  const risk = buildRisk(normalizedMetrics, historicalComparison);
  const rootCause = buildRootCause(normalizedMetrics, infrastructureMemory);
  const recommendations = buildRecommendations({
    metrics: normalizedMetrics,
    risk,
    infrastructureMemory,
    configurationSnapshot,
    chaosReport,
  });
  const trends = buildTrends({
    metrics: normalizedMetrics,
    savedRun: savedRun || normalizedMetrics,
    previousRun,
    historicalRuns,
  });
  const deploymentReadiness = buildDeploymentReadiness({
    metrics: normalizedMetrics,
    health,
    risk,
    chaosReport,
  });
  const operationalInsights = buildOperationalInsights({
    metrics: normalizedMetrics,
    infrastructureMemory,
    risk,
    rootCause,
    recommendations,
  });
  const infrastructureHealth = buildInfrastructureHealth({
    metrics: normalizedMetrics,
    health,
    risk,
    infrastructureMemory,
    deploymentReadiness,
  });
  const resilience = buildResilience({ metrics: normalizedMetrics, chaosReport });
  const historicalIntelligence = buildHistoricalIntelligence(
    infrastructureMemory,
  );

  const executiveSummaryText = buildExecutiveSummary({
    health,
    risk,
    overview,
    failureRate,
    infrastructureMemory,
    trends,
  });

  return {
    generatedAt: new Date().toISOString(),
    projectId,
    runId,
    metrics: normalizedMetrics,
    overview,
    health,
    risk,
    rootCause,
    recommendations,
    trends,
    deploymentReadiness,
    infrastructureHealth,
    operationalInsights,
    historicalComparison,
    historicalIntelligence,
    executiveSummary: {
      text: executiveSummaryText,
      status:
        health.status === "excellent" || health.status === "good"
          ? "Healthy"
          : health.status === "warning"
            ? "Warning"
            : "Critical",
      headline:
        health.score >= 90
          ? "Infrastructure executed successfully with strong reliability and performance."
          : health.score >= 70
            ? "Operational degradation indicators detected during execution."
            : "Critical operational issues detected requiring immediate investigation.",
      findings: [
        `Operational health score: ${health.score}/100 (grade ${health.grade}).`,
        `Success rate: ${rate(overview.success, overview.totalRequests).toFixed(1)}%.`,
        `${overview.totalRequests} requests processed.`,
        `${overview.rps} requests per second achieved.`,
        rootCause.length > 0
          ? `${rootCause.length} root cause signal(s) detected.`
          : "No significant root cause signals detected.",
      ],
    },
    executiveBrief: buildExecutiveBrief({
      health,
      risk,
      overview,
      failureRate,
    }),
    resilience,
    infrastructureMemory,
    configurationSnapshot,
    // Backward-compatible aliases for report builder / PDF
    healthScore: health,
    predictiveRisk: {
      level: risk.level,
      risk: risk.risk,
      forecast: risk.forecast,
      confidence: risk.confidence,
      contributingFactors: risk.contributingFactors,
    },
    rootCauseAnalysis: rootCause,
    aiRecommendations: recommendations,
  };
};

const buildRunIntelligence = async ({ projectId, runId }) => {
  const { savedRun, metrics, previousRun, historicalRuns } =
    await loadRunContext({ projectId, runId });
  const infrastructureMemory = await loadInfrastructureMemory(projectId);

  return computeRunIntelligence({
    projectId,
    runId,
    savedRun,
    metrics,
    previousRun,
    historicalRuns,
    infrastructureMemory,
  });
};

const buildRunIntelligenceFromContext = async ({
  projectId,
  runId,
  savedRun,
  metrics,
  previousRun,
  historicalRuns,
  infrastructureMemory,
}) =>
  computeRunIntelligence({
    projectId,
    runId,
    savedRun,
    metrics,
    previousRun,
    historicalRuns,
    infrastructureMemory,
  });

/**
 * Maps unified intelligence to legacy /api/ai response shape.
 */
const buildLegacyAiAnalysis = (intelligence) => {
  const { metrics, health, rootCause, operationalInsights, recommendations } =
    intelligence;

  const successRate = rate(metrics.success, metrics.totalRequests);

  const anomalies = rootCause.map((cause) => ({
    severity:
      cause.severity === "critical"
        ? "critical"
        : cause.severity === "high"
          ? "high"
          : cause.severity === "moderate"
            ? "medium"
            : "info",
    title: cause.title,
    description: cause.evidence,
  }));

  const insights = operationalInsights.map((insight) => ({
    severity:
      insight.severity === "critical"
        ? "critical"
        : insight.severity === "warning" ||
            insight.severity === "high" ||
            insight.severity === "moderate"
          ? "warning"
          : "info",
    title: insight.title,
    explanation: insight.description,
  }));

  return {
    generatedAt: intelligence.generatedAt,
    metrics,
    score: health.score,
    anomalies,
    insights,
    recommendations: recommendations.map(
      (item) => item.reason || item.title || item.expectedImpact,
    ),
    successRate,
  };
};

module.exports = {
  buildRunIntelligence,
  buildRunIntelligenceFromContext,
  buildLegacyAiAnalysis,
  loadRunContext,
};
