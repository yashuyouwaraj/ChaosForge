const {
  buildRunIntelligence,
  buildLegacyAiAnalysis,
} = require("../intelligence/intelligence.service");
const { createProvider } = require("./providers/provider.factory");
const {
  buildRunContext,
  buildDashboardContext,
  buildCompareContext,
  buildIncidentContext,
  buildWeeklyContext,
  buildChaosAdvisorContext,
  buildOptimizationContext,
  buildChatContext,
  listAvailableModels,
  listAiModes,
  getRoutingInfo,
  resolveAiSettings,
  isProviderConfigured,
} = require("./prompt/context.builder");
const { compressContextForSkill } = require("./prompt/context.compressor");
const { buildPrompt } = require("./prompt/prompt.builder");
const { buildSkillInstruction } = require("./skills/skill.builder");
const {
  formatFromIntelligence,
  mergeLlmResponse,
} = require("./intelligence-response.formatter");
const AIResponse = require("./models/ai-response.model");
const { resolveModelRoute } = require("./router/ai.router");
const {
  getResponseCache,
  setResponseCache,
  getPromptCache,
  setPromptCache,
  buildResponseCacheKey,
  buildPromptHash,
  incrementCacheHit,
  incrementCacheMiss,
  getCacheStats,
} = require("./cache/ai.cache");
const { recordRequest, getMetrics } = require("./metrics/ai.metrics");
const {
  createConversation,
  getConversation,
  appendMessage,
  listConversations,
  updateConversation,
  deleteConversation,
} = require("./session/conversation.service");
const logger = require("../../utils/logger");

const LLM_TIMEOUT_MS = 120_000;

const withTimeout = (promise, ms, label = "LLM request") =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${label} timed out after ${ms}ms`));
      }, ms);
    }),
  ]);

const getAiAnalysis = async (projectId, runId) => {
  const intelligence = await buildRunIntelligence({ projectId, runId });
  return buildLegacyAiAnalysis(intelligence);
};

const CONTEXT_BUILDERS = {
  explainRun: buildRunContext,
  explainDashboard: buildDashboardContext,
  explainReport: buildRunContext,
  compareRuns: async ({ owner, projectId, payload }) =>
    buildCompareContext({
      owner,
      projectId,
      runAId: payload.runAId,
      runBId: payload.runBId,
    }),
  incidentInvestigator: buildIncidentContext,
  executiveBrief: buildRunContext,
  optimizationAdvisor: buildOptimizationContext,
  chaosExperimentAdvisor: buildChaosAdvisorContext,
  capacityPlanner: buildRunContext,
  runbook: buildRunContext,
  postmortem: buildRunContext,
  aiReportGenerator: buildRunContext,
  weeklyInfrastructureReview: buildWeeklyContext,
  askChaosForge: buildChatContext,
};

const resolveContext = async ({
  skill,
  owner,
  projectId,
  runId,
  payload = {},
}) => {
  const builder = CONTEXT_BUILDERS[skill];

  if (!builder) {
    throw new Error(`Unknown AI skill: ${skill}`);
  }

  if (skill === "compareRuns") {
    return builder({ owner, projectId, payload });
  }

  if (skill === "weeklyInfrastructureReview") {
    return builder({ owner, projectId });
  }

  if (skill === "explainDashboard") {
    return builder({ owner, projectId, runId });
  }

  if (skill === "chaosExperimentAdvisor") {
    return builder({ owner, projectId, runId, goal: payload.goal });
  }

  if (skill === "askChaosForge") {
    return builder({
      owner,
      projectId,
      runId,
      conversationMessages: payload.conversationMessages || [],
    });
  }

  return builder({ owner, projectId, runId });
};

const buildIntelligenceFallback = ({ skill, intelligence }) => {
  if (intelligence) {
    return formatFromIntelligence({ skill, intelligence });
  }

  return new AIResponse({
    skill,
    summary: "Operational context loaded.",
    cards: [],
    findings: [],
    recommendations: [],
    confidence: 80,
    metadata: { source: "intelligence-engine" },
  });
};

const enrichMetadata = (response, { route, settings, cached, startedAt }) => {
  const json = response.toJSON ? response.toJSON() : response;

  json.metadata = {
    ...json.metadata,
    provider: settings.provider || "nvidia",
    providerDisplayName: "NVIDIA",
    mode: settings.mode || "automatic",
    model: json.metadata?.model || route.preferredDisplayName,
    modelKey: json.metadata?.modelKey || route.preferredModel,
    reasoningModel: route.reasoning,
    cached: Boolean(cached),
    responseTimeMs: Date.now() - startedAt,
    route: {
      preferredModel: route.preferredModel,
      routingSource: route.routingSource,
      fallbackModels: route.fallbackModels,
    },
    streaming: json.metadata?.streaming || false,
    confidence: json.confidence,
  };

  return json;
};

const generateWithSkill = async ({
  owner,
  skill,
  projectId,
  runId,
  payload = {},
  force = false,
}) => {
  const startedAt = Date.now();
  const settings = await resolveAiSettings(owner);
  const route = resolveModelRoute({
    skill,
    mode: settings.mode,
    customModel: settings.mode === "custom" ? settings.model : null,
  });

  const cacheKey = buildResponseCacheKey({
    owner,
    skill,
    projectId,
    runId,
    payload,
  });

  if (!force) {
    const cached = await getResponseCache(cacheKey);

    if (cached?.data) {
      await incrementCacheHit();
      await recordRequest({
        skill,
        model: route.preferredModel,
        mode: settings.mode,
        cached: true,
        responseTimeMs: Date.now() - startedAt,
      });

      return enrichMetadata(cached.data, {
        route,
        settings,
        cached: true,
        startedAt,
      });
    }

    await incrementCacheMiss();
  }

  const rawContext = await resolveContext({
    skill,
    owner,
    projectId,
    runId,
    payload,
  });

  const context = compressContextForSkill(rawContext, skill);

  const intelligence =
    context.intelligence ||
    context.runA?.intelligence ||
    context.runB?.intelligence ||
    null;

  const formatted = buildIntelligenceFallback({ skill, intelligence });

  if (!isProviderConfigured()) {
    logger.warn({
      message: "NVIDIA API key not configured; returning intelligence-formatted response",
      skill,
      projectId,
      runId,
    });

    return enrichMetadata(formatted, { route, settings, cached: false, startedAt });
  }

  const instruction = buildSkillInstruction(skill, payload);
  const prompt = buildPrompt({ instruction, context });
  const promptHash = buildPromptHash(prompt);

  const promptCached = await getPromptCache(promptHash);

  if (promptCached && !force) {
    await incrementCacheHit();
    const merged = mergeLlmResponse(formatted, promptCached);
    const result = enrichMetadata(merged, {
      route,
      settings,
      cached: true,
      startedAt,
    });
    await setResponseCache(cacheKey, result);

    await recordRequest({
      skill,
      model: route.preferredModel,
      mode: settings.mode,
      cached: true,
      responseTimeMs: Date.now() - startedAt,
    });

    return result;
  }

  const provider = await createProvider(owner, { skill });
  let llmResult;

  try {
    llmResult = await withTimeout(
      provider.generate(prompt),
      LLM_TIMEOUT_MS,
      `AI skill ${skill}`,
    );
  } catch (err) {
    logger.warn({
      message: "LLM generation failed; falling back to intelligence formatter",
      skill,
      error: err.message,
    });

    await recordRequest({
      skill,
      model: route.preferredModel,
      mode: settings.mode,
      failed: true,
      responseTimeMs: Date.now() - startedAt,
    });

    return enrichMetadata(formatted, { route, settings, cached: false, startedAt });
  }

  const merged = mergeLlmResponse(formatted, {
    executiveSummary: llmResult.summary,
    summary: llmResult.summary,
    cards: llmResult.metadata?.cards || llmResult.cards,
    findings: llmResult.findings,
    recommendations: llmResult.recommendations,
    confidence: llmResult.confidence,
    rootCause: llmResult.metadata?.rootCause,
    metadata: llmResult.metadata,
  });

  const result = enrichMetadata(merged, {
    route,
    settings,
    cached: false,
    startedAt,
  });

  await setPromptCache(promptHash, {
    executiveSummary: llmResult.summary,
    summary: llmResult.summary,
    cards: llmResult.metadata?.cards || llmResult.cards,
    findings: llmResult.findings,
    recommendations: llmResult.recommendations,
    confidence: llmResult.confidence,
    rootCause: llmResult.metadata?.rootCause,
    metadata: llmResult.metadata,
  });

  await setResponseCache(cacheKey, result);

  await recordRequest({
    skill,
    model: llmResult.metadata?.modelKey || route.preferredModel,
    mode: settings.mode,
    cached: false,
    ttftMs: llmResult.metadata?.ttftMs,
    responseTimeMs: llmResult.metadata?.responseTimeMs || Date.now() - startedAt,
    usage: llmResult.metadata?.usage,
    retries: llmResult.metadata?.retries || 0,
  });

  return result;
};

const generateWithSkillStream = async ({
  owner,
  skill,
  projectId,
  runId,
  payload = {},
  onChunk,
  onFirstToken,
  signal,
}) => {
  const startedAt = Date.now();
  const settings = await resolveAiSettings(owner);
  const route = resolveModelRoute({
    skill,
    mode: settings.mode,
    customModel: settings.mode === "custom" ? settings.model : null,
  });

  const rawContext = await resolveContext({
    skill,
    owner,
    projectId,
    runId,
    payload,
  });

  const context = compressContextForSkill(rawContext, skill);
  const intelligence =
    context.intelligence ||
    context.runA?.intelligence ||
    context.runB?.intelligence ||
    null;

  const formatted = buildIntelligenceFallback({ skill, intelligence });

  if (!isProviderConfigured()) {
    const fallback = enrichMetadata(formatted, {
      route,
      settings,
      cached: false,
      startedAt,
    });

    if (onChunk && fallback.summary) {
      onChunk(fallback.summary, { type: "token" });
    }

    return fallback;
  }

  const instruction = buildSkillInstruction(skill, payload);
  const prompt = buildPrompt({ instruction, context });
  const provider = await createProvider(owner, { skill });

  let ttftMs = null;

  try {
    const llmResult = await withTimeout(
      provider.stream(
        prompt,
        (token, meta) => {
          if (onChunk) {
            onChunk(token, { type: "token", ...meta });
          }
        },
        {
          onFirstToken: (ms) => {
            ttftMs = ms;

            if (onFirstToken) {
              onFirstToken(ms);
            }
          },
          signal,
        },
      ),
      LLM_TIMEOUT_MS,
      `AI stream ${skill}`,
    );

    const merged = mergeLlmResponse(formatted, {
      executiveSummary: llmResult.summary,
      summary: llmResult.summary,
      cards: llmResult.metadata?.cards || llmResult.cards,
      findings: llmResult.findings,
      recommendations: llmResult.recommendations,
      confidence: llmResult.confidence,
      rootCause: llmResult.metadata?.rootCause,
      metadata: { ...llmResult.metadata, streaming: true },
    });

    const result = enrichMetadata(merged, {
      route,
      settings,
      cached: false,
      startedAt,
    });

    await recordRequest({
      skill,
      model: llmResult.metadata?.modelKey || route.preferredModel,
      mode: settings.mode,
      streaming: true,
      ttftMs: ttftMs ?? llmResult.metadata?.ttftMs,
      responseTimeMs: llmResult.metadata?.responseTimeMs || Date.now() - startedAt,
      usage: llmResult.metadata?.usage,
    });

    return result;
  } catch (err) {
    if (err.message === "Stream aborted") {
      throw err;
    }

    logger.warn({
      message: "Streaming failed; falling back to intelligence formatter",
      skill,
      error: err.message,
    });

    const fallback = enrichMetadata(formatted, {
      route,
      settings,
      cached: false,
      startedAt,
    });

    await recordRequest({
      skill,
      model: route.preferredModel,
      mode: settings.mode,
      streaming: true,
      failed: true,
      responseTimeMs: Date.now() - startedAt,
    });

    return fallback;
  }
};

const generateExplainRun = (params) =>
  generateWithSkill({ ...params, skill: "explainRun" });

const generateExplainDashboard = (params) =>
  generateWithSkill({ ...params, skill: "explainDashboard" });

const generateExplainReport = (params) =>
  generateWithSkill({ ...params, skill: "explainReport" });

const generateRunComparison = (params) =>
  generateWithSkill({
    ...params,
    skill: "compareRuns",
    payload: {
      runAId: params.runAId,
      runBId: params.runBId,
    },
  });

const generateIncidentInvestigation = (params) =>
  generateWithSkill({ ...params, skill: "incidentInvestigator" });

const generateExecutiveBrief = (params) =>
  generateWithSkill({ ...params, skill: "executiveBrief" });

const generateOptimizationAdvisor = (params) =>
  generateWithSkill({ ...params, skill: "optimizationAdvisor" });

const generateChaosExperimentAdvisor = (params) =>
  generateWithSkill({
    ...params,
    skill: "chaosExperimentAdvisor",
    payload: { goal: params.goal },
  });

const generateCapacityPlanning = (params) =>
  generateWithSkill({ ...params, skill: "capacityPlanner" });

const generateRunbook = (params) =>
  generateWithSkill({ ...params, skill: "runbook" });

const generatePostmortem = (params) =>
  generateWithSkill({ ...params, skill: "postmortem" });

const generateAiReport = (params) =>
  generateWithSkill({ ...params, skill: "aiReportGenerator" });

const generateWeeklyReview = (params) =>
  generateWithSkill({ ...params, skill: "weeklyInfrastructureReview" });

const startConversation = async ({
  owner,
  projectId,
  runId,
  skill = "askChaosForge",
  title,
}) =>
  createConversation({
    owner,
    projectId,
    runId,
    skill,
    title,
  });

const sendConversationMessage = async ({
  owner,
  conversationId,
  message,
  stream = false,
  onChunk,
  onFirstToken,
  signal,
}) => {
  const conversation = await getConversation({ owner, conversationId });

  await appendMessage({
    owner,
    conversationId,
    role: "user",
    content: message,
  });

  const generateParams = {
    owner,
    skill: conversation.skill || "askChaosForge",
    projectId: conversation.projectId,
    runId: conversation.runId !== "general" ? conversation.runId : null,
    payload: {
      message,
      conversationMessages: conversation.messages,
    },
  };

  const response = stream
    ? await generateWithSkillStream({
        ...generateParams,
        onChunk,
        onFirstToken,
        signal,
      })
    : await generateWithSkill(generateParams);

  await appendMessage({
    owner,
    conversationId,
    role: "assistant",
    content: response.summary,
    metadata: response,
  });

  if (!conversation.title || conversation.title === "ChaosForge Conversation" || conversation.title === "Ask ChaosForge") {
    const titlePreview = message.slice(0, 60);
    await updateConversation({
      owner,
      conversationId,
      updates: { title: titlePreview },
    });
  }

  return {
    conversationId,
    response,
  };
};

const getAiPlatformStatus = async (owner) => {
  const settings = await resolveAiSettings(owner);
  const metrics = await getMetrics();
  const cache = await getCacheStats();

  return {
    provider: settings.provider,
    mode: settings.mode,
    model: settings.model,
    configured: isProviderConfigured(),
    metrics,
    cache,
    routing: getRoutingInfo(),
  };
};

module.exports = {
  getAiAnalysis,
  generateWithSkill,
  generateWithSkillStream,
  generateExplainRun,
  generateExplainDashboard,
  generateExplainReport,
  generateRunComparison,
  generateIncidentInvestigation,
  generateExecutiveBrief,
  generateOptimizationAdvisor,
  generateChaosExperimentAdvisor,
  generateCapacityPlanning,
  generateRunbook,
  generatePostmortem,
  generateAiReport,
  generateWeeklyReview,
  startConversation,
  sendConversationMessage,
  getConversation,
  listConversations,
  updateConversation,
  deleteConversation,
  listAvailableModels,
  listAiModes,
  getRoutingInfo,
  getAiPlatformStatus,
  getMetrics,
  getCacheStats,
  isProviderConfigured,
};
