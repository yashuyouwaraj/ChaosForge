const { getIOIfReady } = require("../../websocket/socket");
const { INTELLIGENCE_UPDATE_EVENT } = require("../../websocket/events");
const logger = require("../../utils/logger");
const {
  buildRunIntelligenceFromContext,
  loadRunContext,
} = require("./intelligence.service");
const { loadInfrastructureMemory } = require("./engines/memory.engine");

const INTELLIGENCE_FLUSH_INTERVAL_MS = 2000;
const MIN_EMIT_INTERVAL_MS = 2000;

const pendingMetrics = new Map();
const runContextCache = new Map();
const infrastructureMemoryCache = new Map();
const lastFingerprint = new Map();
const lastEmitAt = new Map();
let flushLoopStarted = false;

const getRunKey = (projectId, runId) => `${projectId}:${runId}`;

const buildStreamPayload = (intelligence) => ({
  projectId: intelligence.projectId,
  runId: intelligence.runId,
  timestamp: intelligence.generatedAt,
  health: intelligence.health,
  risk: intelligence.risk,
  rootCause: intelligence.rootCause,
  recommendations: intelligence.recommendations,
  trend: intelligence.trends,
  operationalInsights: intelligence.operationalInsights,
});

const buildFingerprint = (payload) =>
  JSON.stringify({
    healthScore: payload.health?.score,
    healthGrade: payload.health?.grade,
    healthStatus: payload.health?.status,
    risk: payload.risk?.risk,
    riskLevel: payload.risk?.level,
    rootCause: (payload.rootCause || []).map(
      (item) => `${item.title}:${item.severity}:${item.confidence}`,
    ),
    recommendations: (payload.recommendations || []).map(
      (item) => `${item.title}:${item.priority}`,
    ),
    trend: payload.trend,
    operationalInsights: (payload.operationalInsights || []).map(
      (item) => `${item.title}:${item.severity}`,
    ),
  });

const getCachedInfrastructureMemory = async (projectId) => {
  if (infrastructureMemoryCache.has(projectId)) {
    return infrastructureMemoryCache.get(projectId);
  }

  const memory = await loadInfrastructureMemory(projectId);
  infrastructureMemoryCache.set(projectId, memory);
  return memory;
};

const getCachedRunContext = async (projectId, runId) => {
  const key = getRunKey(projectId, runId);

  if (runContextCache.has(key)) {
    return runContextCache.get(key);
  }

  const { savedRun, previousRun, historicalRuns } = await loadRunContext({
    projectId,
    runId,
  });
  const infrastructureMemory = await getCachedInfrastructureMemory(projectId);

  const context = {
    savedRun,
    previousRun,
    historicalRuns,
    infrastructureMemory,
  };

  runContextCache.set(key, context);
  return context;
};

const scheduleIntelligenceUpdate = (projectId, runId, metrics) => {
  if (!projectId || !runId || !metrics) {
    return;
  }

  pendingMetrics.set(getRunKey(projectId, runId), {
    projectId,
    runId,
    metrics,
  });
};

const clearIntelligenceStream = (projectId, runId) => {
  const key = getRunKey(projectId, runId);

  pendingMetrics.delete(key);
  runContextCache.delete(key);
  lastFingerprint.delete(key);
  lastEmitAt.delete(key);
};

const flushIntelligenceUpdates = async () => {
  const io = getIOIfReady();

  if (!io || pendingMetrics.size === 0) {
    return;
  }

  const now = Date.now();

  for (const [key, entry] of pendingMetrics.entries()) {
    const lastEmit = lastEmitAt.get(key) || 0;

    if (now - lastEmit < MIN_EMIT_INTERVAL_MS) {
      continue;
    }

    const { projectId, runId, metrics } = entry;

    try {
      const context = await getCachedRunContext(projectId, runId);
      const intelligence = await buildRunIntelligenceFromContext({
        projectId,
        runId,
        metrics,
        ...context,
      });
      const payload = buildStreamPayload(intelligence);
      const fingerprint = buildFingerprint(payload);

      if (lastFingerprint.get(key) === fingerprint) {
        lastEmitAt.set(key, now);
        pendingMetrics.delete(key);
        continue;
      }

      io.to(`run-${runId}`).emit(INTELLIGENCE_UPDATE_EVENT, payload);

      lastFingerprint.set(key, fingerprint);
      lastEmitAt.set(key, now);
      pendingMetrics.delete(key);
    } catch (err) {
      logger.warn({
        message: "intelligence_stream_emit_failed",
        projectId,
        runId,
        error: err.message,
      });
    }
  }
};

const startIntelligenceStreamLoop = () => {
  if (flushLoopStarted) {
    return;
  }

  flushLoopStarted = true;

  setInterval(() => {
    flushIntelligenceUpdates().catch((err) => {
      logger.warn({
        message: "intelligence_stream_flush_failed",
        error: err.message,
      });
    });
  }, INTELLIGENCE_FLUSH_INTERVAL_MS);
};

startIntelligenceStreamLoop();

module.exports = {
  scheduleIntelligenceUpdate,
  clearIntelligenceStream,
};
