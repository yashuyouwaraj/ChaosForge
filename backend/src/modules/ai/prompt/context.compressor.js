const crypto = require("crypto");

const { FAST_SKILLS } = require("../models/ai.model");

const compressRun = (run) => {
  if (!run) {
    return null;
  }

  return {
    runId: run.runId,
    status: run.status,
    totalRequests: run.totalRequests,
    success: run.success,
    failure: run.failure,
    avgLatency: run.avgLatency,
    p95Latency: run.p95Latency,
    p99Latency: run.p99Latency,
    rps: run.rps,
    duration: run.duration,
    createdAt: run.createdAt,
  };
};

const compressIntelligence = (intelligence) => {
  if (!intelligence) {
    return null;
  }

  return {
    health: intelligence.health
      ? {
          score: intelligence.health.score,
          status: intelligence.health.status,
          grade: intelligence.health.grade,
          confidence: intelligence.health.confidence,
          reasoning: (intelligence.health.reasoning || []).slice(0, 3),
        }
      : null,
    risk: intelligence.risk
      ? {
          level: intelligence.risk.level,
          risk: intelligence.risk.risk,
          forecast: intelligence.risk.forecast,
          confidence: intelligence.risk.confidence,
          contributingFactors: (intelligence.risk.contributingFactors || []).slice(
            0,
            5,
          ),
        }
      : null,
    rootCause: (intelligence.rootCause || []).slice(0, 5),
    trends: intelligence.trends,
    recommendations: (intelligence.recommendations || []).slice(0, 8),
    operationalInsights: (intelligence.operationalInsights || []).slice(0, 6),
    executiveSummary: intelligence.executiveSummary,
    executiveBrief: intelligence.executiveBrief,
    infrastructureMemory: intelligence.infrastructureMemory
      ? {
          patterns: (intelligence.infrastructureMemory.patterns || []).slice(
            0,
            5,
          ),
        }
      : null,
  };
};

const compressContextForSkill = (context, skill) => {
  if (!context || !skill) {
    return context;
  }

  if (skill === "askChaosForge") {
    return {
      projectId: context.projectId,
      runId: context.runId,
      intelligence: compressIntelligence(context.intelligence),
      conversationMessages: (context.conversationMessages || []).slice(-10),
      metadata: context.metadata,
    };
  }

  if (FAST_SKILLS.has(skill)) {
    return {
      generatedAt: context.generatedAt,
      projectId: context.projectId,
      runId: context.runId,
      run: compressRun(context.run),
      intelligence: compressIntelligence(context.intelligence),
      incidents: (context.incidents || []).slice(0, 5),
      metadata: context.metadata,
    };
  }

  if (skill === "compareRuns") {
    return {
      generatedAt: context.generatedAt,
      projectId: context.projectId,
      runA: {
        runId: context.runA?.runId,
        run: compressRun(context.runA?.run),
        intelligence: compressIntelligence(context.runA?.intelligence),
      },
      runB: {
        runId: context.runB?.runId,
        run: compressRun(context.runB?.run),
        intelligence: compressIntelligence(context.runB?.intelligence),
      },
      comparison: context.comparison,
      metadata: context.metadata,
    };
  }

  if (skill === "weeklyInfrastructureReview") {
    return {
      generatedAt: context.generatedAt,
      projectId: context.projectId,
      recentRuns: (context.recentRuns || []).slice(0, 15),
      infrastructureMemory: (context.infrastructureMemory || []).slice(0, 10),
      incidents: (context.incidents || []).slice(0, 15),
      metadata: context.metadata,
    };
  }

  if (skill === "chaosExperimentAdvisor") {
    return {
      ...compressContextForSkill({ ...context, skill: "explainRun" }, "explainRun"),
      userGoal: context.userGoal,
      chaosConfig: context.run?.chaosConfig || context.run?.configurationSnapshot?.chaos,
    };
  }

  return {
    ...context,
    run: compressRun(context.run),
    intelligence: compressIntelligence(context.intelligence),
    previousRuns: (context.previousRuns || []).slice(0, 5),
    infrastructureMemory: (context.infrastructureMemory || []).slice(0, 8),
    incidents: (context.incidents || []).slice(0, 10),
  };
};

const hashContext = (context) =>
  crypto.createHash("sha256").update(JSON.stringify(context)).digest("hex").slice(0, 16);

module.exports = {
  compressRun,
  compressIntelligence,
  compressContextForSkill,
  hashContext,
};
