const { buildRunIntelligence } = require("../../intelligence/intelligence.service");
const Run = require("../../run/run.model");
const InfrastructureMemory = require("../../memory/memory.model");
const { getIncidentTimeline } = require("../../../services/incidentTimeline");
const { compareRuns } = require("../../run/run.compare.service");
const { listModelRegistry, AI_MODES } = require("../models/ai.model");
const { getSkillRoutingTable } = require("../router/ai.router");
const { getSettings } = require("../../settings/settings.service");
const { AI_PROVIDER, AI_MODEL, NVIDIA } = require("../config/ai.config");

const runQuery = ({ owner, projectId, runId }) => {
  const query = { projectId, runId };

  if (owner) {
    query.owner = owner;
  }

  return query;
};

const resolveAiSettings = async (owner) => {
  const defaults = {
    provider: AI_PROVIDER,
    mode: "automatic",
    model: AI_MODEL,
  };

  if (!owner) {
    return defaults;
  }

  try {
    const settings = await getSettings(owner);
    const ai = settings?.ai || {};

    return {
      provider: ai.provider || defaults.provider,
      mode: ai.mode || defaults.mode,
      model: ai.model || defaults.model,
    };
  } catch {
    return defaults;
  }
};

const listAvailableModels = () => listModelRegistry();

const listAiModes = () => Object.values(AI_MODES);

const getRoutingInfo = () => ({
  skills: getSkillRoutingTable(),
  modes: listAiModes(),
});

const loadRun = async ({ owner, projectId, runId }) => {
  const run = await Run.findOne(runQuery({ owner, projectId, runId })).lean();

  if (!run) {
    throw new Error("Run not found.");
  }

  return run;
};

const loadProjectRuns = async ({ owner, projectId, limit = 20 }) => {
  const query = { projectId, totalRequests: { $gt: 0 } };

  if (owner) {
    query.owner = owner;
  }

  return Run.find(query).sort({ createdAt: -1 }).limit(limit).lean();
};

const buildRunContext = async ({ owner, projectId, runId }) => {
  const run = await loadRun({ owner, projectId, runId });
  const intelligence = await buildRunIntelligence({ projectId, runId });

  const memories = await InfrastructureMemory.find({ projectId })
    .sort({ detectionCount: -1, confidence: -1 })
    .limit(10)
    .lean();

  const previousRuns = await loadProjectRuns({
    owner,
    projectId,
    limit: 10,
  });

  const incidents = getIncidentTimeline().filter(
    (incident) => incident?.metadata?.runId === runId,
  );

  const aiSettings = await resolveAiSettings(owner);

  return {
    generatedAt: new Date(),
    projectId,
    runId,
    run,
    intelligence,
    infrastructureMemory: memories,
    previousRuns: previousRuns.filter((item) => item.runId !== runId),
    incidents,
    metadata: {
      aiVersion: "1.0.0",
      intelligenceVersion: "1.0.0",
      provider: aiSettings.provider,
      model: aiSettings.model,
    },
  };
};

const buildDashboardContext = async ({ owner, projectId, runId = null }) => {
  const runs = await loadProjectRuns({ owner, projectId, limit: 10 });
  const targetRunId = runId || runs[0]?.runId;

  let intelligence = null;
  let run = null;

  if (targetRunId) {
    run = await Run.findOne(
      runQuery({ owner, projectId, runId: targetRunId }),
    ).lean();
    intelligence = await buildRunIntelligence({
      projectId,
      runId: targetRunId,
    });
  }

  const memories = await InfrastructureMemory.find({ projectId })
    .sort({ detectionCount: -1 })
    .limit(10)
    .lean();

  const incidents = getIncidentTimeline().slice(0, 20);
  const aiSettings = await resolveAiSettings(owner);

  return {
    generatedAt: new Date(),
    projectId,
    runId: targetRunId,
    run,
    intelligence,
    recentRuns: runs,
    infrastructureMemory: memories,
    incidents,
    metadata: {
      aiVersion: "1.0.0",
      provider: aiSettings.provider,
      model: aiSettings.model,
    },
  };
};

const buildCompareContext = async ({
  owner,
  projectId,
  runAId,
  runBId,
}) => {
  const runA = await loadRun({ owner, projectId, runId: runAId });
  const runB = await loadRun({ owner, projectId, runId: runBId });

  const intelligenceA = await buildRunIntelligence({
    projectId,
    runId: runAId,
  });
  const intelligenceB = await buildRunIntelligence({
    projectId,
    runId: runBId,
  });

  const comparison = compareRuns(runA, runB);
  const aiSettings = await resolveAiSettings(owner);

  return {
    generatedAt: new Date(),
    projectId,
    runA: { runId: runAId, run: runA, intelligence: intelligenceA },
    runB: { runId: runBId, run: runB, intelligence: intelligenceB },
    comparison,
    metadata: {
      provider: aiSettings.provider,
      model: aiSettings.model,
    },
  };
};

const buildIncidentContext = async ({ owner, projectId, runId }) => {
  const base = await buildRunContext({ owner, projectId, runId });
  const allIncidents = getIncidentTimeline();

  return {
    ...base,
    incidents: allIncidents.filter(
      (incident) =>
        incident?.metadata?.runId === runId ||
        incident?.metadata?.projectId === projectId,
    ),
    relatedIncidents: allIncidents.slice(0, 30),
  };
};

const buildWeeklyContext = async ({ owner, projectId }) => {
  const runs = await loadProjectRuns({ owner, projectId, limit: 50 });
  const memories = await InfrastructureMemory.find({ projectId })
    .sort({ detectionCount: -1 })
    .lean();
  const incidents = getIncidentTimeline().slice(0, 50);
  const aiSettings = await resolveAiSettings(owner);

  const runSummaries = [];

  for (const run of runs.slice(0, 10)) {
    runSummaries.push({
      runId: run.runId,
      createdAt: run.createdAt,
      totalRequests: run.totalRequests,
      failure: run.failure,
      avgLatency: run.avgLatency,
      p95Latency: run.p95Latency,
      rps: run.rps,
    });
  }

  return {
    generatedAt: new Date(),
    projectId,
    recentRuns: runSummaries,
    infrastructureMemory: memories,
    incidents,
    metadata: {
      provider: aiSettings.provider,
      model: aiSettings.model,
    },
  };
};

const buildChaosAdvisorContext = async ({
  owner,
  projectId,
  runId,
  goal,
}) => {
  const base = runId
    ? await buildRunContext({ owner, projectId, runId })
    : await buildDashboardContext({ owner, projectId });

  return {
    ...base,
    userGoal: goal || "",
  };
};

const buildOptimizationContext = async ({ owner, projectId, runId }) =>
  buildRunContext({ owner, projectId, runId });

const buildChatContext = async ({
  owner,
  projectId,
  runId,
  conversationMessages = [],
}) => {
  const base = runId
    ? await buildRunContext({ owner, projectId, runId })
    : await buildDashboardContext({ owner, projectId });

  return {
    ...base,
    conversationMessages,
  };
};

module.exports = {
  buildContext: buildRunContext,
  buildRunContext,
  buildDashboardContext,
  buildCompareContext,
  buildIncidentContext,
  buildWeeklyContext,
  buildChaosAdvisorContext,
  buildOptimizationContext,
  buildChatContext,
  resolveAiSettings,
  listAvailableModels,
  listAiModes,
  getRoutingInfo,
  isProviderConfigured: () => Boolean(NVIDIA.apiKey),
};
