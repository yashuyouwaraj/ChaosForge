const {
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
} = require("./ai.service");
const logger = require("../../utils/logger");

const handleError = (res, err, fallbackMessage) => {
  logger.error({ message: err.message || fallbackMessage, stack: err.stack });

  const status = err.message?.includes("not found") ? 404 : 500;

  return res.status(status).json({
    error: err.message || fallbackMessage,
  });
};

const setupSse = (res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
};

const sendSseEvent = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const streamSkillGeneration = async (req, res, params) => {
  setupSse(res);

  const abortController = new AbortController();

  req.on("close", () => {
    abortController.abort();
  });

  try {
    sendSseEvent(res, "start", { skill: params.skill });

    const result = await generateWithSkillStream({
      ...params,
      onChunk: (token, meta) => {
        sendSseEvent(res, "token", { token, ...meta });
      },
      onFirstToken: (ttftMs) => {
        sendSseEvent(res, "ttft", { ttftMs });
      },
      signal: abortController.signal,
    });

    sendSseEvent(res, "done", result);
    res.end();
  } catch (err) {
    if (err.message === "Stream aborted") {
      sendSseEvent(res, "aborted", { message: "Generation stopped" });
      res.end();
      return;
    }

    sendSseEvent(res, "error", { error: err.message || "Stream failed" });
    res.end();
  }
};

const getAnalysis = async (req, res) => {
  try {
    const { projectId, runId } = req.params;
    const analysis = await getAiAnalysis(projectId, runId);
    res.json(analysis);
  } catch (err) {
    handleError(res, err, "Failed to get AI analysis");
  }
};

const getModels = async (_req, res) => {
  try {
    res.json({
      models: listAvailableModels(),
      modes: listAiModes(),
      routing: getRoutingInfo(),
      configured: isProviderConfigured(),
      defaultProvider: "nvidia",
    });
  } catch (err) {
    handleError(res, err, "Failed to list AI models");
  }
};

const getAiMetrics = async (_req, res) => {
  try {
    const [metrics, cache] = await Promise.all([getMetrics(), getCacheStats()]);
    res.json({ metrics, cache, configured: isProviderConfigured() });
  } catch (err) {
    handleError(res, err, "Failed to get AI metrics");
  }
};

const getAiStatus = async (req, res) => {
  try {
    const status = await getAiPlatformStatus(req.user.id);
    res.json(status);
  } catch (err) {
    handleError(res, err, "Failed to get AI status");
  }
};

const getAiRoute = async (req, res) => {
  try {
    const { skill } = req.query;
    const { resolveModelRoute } = require("./router/ai.router");
    const { resolveAiSettings } = require("./prompt/context.builder");
    const settings = await resolveAiSettings(req.user.id);

    if (!skill) {
      return res.json(getRoutingInfo());
    }

    res.json(
      resolveModelRoute({
        skill,
        mode: settings.mode,
        customModel: settings.mode === "custom" ? settings.model : null,
      }),
    );
  } catch (err) {
    handleError(res, err, "Failed to resolve AI route");
  }
};

const postStreamSkill = async (req, res) => {
  const { skill, projectId, runId, ...payload } = req.body;

  if (!skill) {
    return res.status(400).json({ error: "skill is required" });
  }

  await streamSkillGeneration(req, res, {
    owner: req.user.id,
    skill,
    projectId,
    runId,
    payload,
  });
};

const postExplainRun = async (req, res) => {
  try {
    const { projectId, runId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "explainRun",
        projectId,
        runId,
        payload: {},
      });
    }

    const response = await generateExplainRun({
      owner: req.user.id,
      projectId,
      runId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to explain run");
  }
};

const postExplainDashboard = async (req, res) => {
  try {
    const { projectId, runId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "explainDashboard",
        projectId,
        runId,
        payload: {},
      });
    }

    const response = await generateExplainDashboard({
      owner: req.user.id,
      projectId,
      runId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to explain dashboard");
  }
};

const postExplainReport = async (req, res) => {
  try {
    const { projectId, runId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "explainReport",
        projectId,
        runId,
        payload: {},
      });
    }

    const response = await generateExplainReport({
      owner: req.user.id,
      projectId,
      runId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to explain report");
  }
};

const postCompareRuns = async (req, res) => {
  try {
    const { projectId, runAId, runBId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "compareRuns",
        projectId,
        payload: { runAId, runBId },
      });
    }

    const response = await generateRunComparison({
      owner: req.user.id,
      projectId,
      runAId,
      runBId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to compare runs");
  }
};

const postInvestigateIncident = async (req, res) => {
  try {
    const { projectId, runId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "incidentInvestigator",
        projectId,
        runId,
        payload: {},
      });
    }

    const response = await generateIncidentInvestigation({
      owner: req.user.id,
      projectId,
      runId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to investigate incident");
  }
};

const postExecutiveBrief = async (req, res) => {
  try {
    const { projectId, runId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "executiveBrief",
        projectId,
        runId,
        payload: {},
      });
    }

    const response = await generateExecutiveBrief({
      owner: req.user.id,
      projectId,
      runId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to generate executive brief");
  }
};

const postOptimizationAdvisor = async (req, res) => {
  try {
    const { projectId, runId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "optimizationAdvisor",
        projectId,
        runId,
        payload: {},
      });
    }

    const response = await generateOptimizationAdvisor({
      owner: req.user.id,
      projectId,
      runId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to generate optimization advice");
  }
};

const postChaosAdvisor = async (req, res) => {
  try {
    const { projectId, runId, goal, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "chaosExperimentAdvisor",
        projectId,
        runId,
        payload: { goal },
      });
    }

    const response = await generateChaosExperimentAdvisor({
      owner: req.user.id,
      projectId,
      runId,
      goal,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to generate chaos experiment advice");
  }
};

const postCapacityPlanner = async (req, res) => {
  try {
    const { projectId, runId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "capacityPlanner",
        projectId,
        runId,
        payload: {},
      });
    }

    const response = await generateCapacityPlanning({
      owner: req.user.id,
      projectId,
      runId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to generate capacity plan");
  }
};

const postRunbook = async (req, res) => {
  try {
    const { projectId, runId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "runbook",
        projectId,
        runId,
        payload: {},
      });
    }

    const response = await generateRunbook({
      owner: req.user.id,
      projectId,
      runId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to generate runbook");
  }
};

const postPostmortem = async (req, res) => {
  try {
    const { projectId, runId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "postmortem",
        projectId,
        runId,
        payload: {},
      });
    }

    const response = await generatePostmortem({
      owner: req.user.id,
      projectId,
      runId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to generate postmortem");
  }
};

const postAiReport = async (req, res) => {
  try {
    const { projectId, runId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "aiReportGenerator",
        projectId,
        runId,
        payload: {},
      });
    }

    const response = await generateAiReport({
      owner: req.user.id,
      projectId,
      runId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to generate AI report");
  }
};

const postWeeklyReview = async (req, res) => {
  try {
    const { projectId, stream } = req.body;

    if (stream) {
      return streamSkillGeneration(req, res, {
        owner: req.user.id,
        skill: "weeklyInfrastructureReview",
        projectId,
        payload: {},
      });
    }

    const response = await generateWeeklyReview({
      owner: req.user.id,
      projectId,
      force: req.body.force,
    });
    res.json(response);
  } catch (err) {
    handleError(res, err, "Failed to generate weekly review");
  }
};

const postCreateConversation = async (req, res) => {
  try {
    const { projectId, runId, skill, title } = req.body;
    const conversation = await startConversation({
      owner: req.user.id,
      projectId,
      runId,
      skill,
      title,
    });
    res.status(201).json(conversation);
  } catch (err) {
    handleError(res, err, "Failed to create conversation");
  }
};

const getConversationById = async (req, res) => {
  try {
    const conversation = await getConversation({
      owner: req.user.id,
      conversationId: req.params.conversationId,
    });
    res.json(conversation);
  } catch (err) {
    handleError(res, err, "Failed to load conversation");
  }
};

const getConversationList = async (req, res) => {
  try {
    const conversations = await listConversations({
      owner: req.user.id,
      projectId: req.query.projectId,
      search: req.query.search,
      includeEmpty: req.query.includeEmpty === "true",
    });
    res.json(conversations);
  } catch (err) {
    handleError(res, err, "Failed to list conversations");
  }
};

const patchConversation = async (req, res) => {
  try {
    const conversation = await updateConversation({
      owner: req.user.id,
      conversationId: req.params.conversationId,
      updates: req.body,
    });
    res.json(conversation);
  } catch (err) {
    handleError(res, err, "Failed to update conversation");
  }
};

const deleteConversationById = async (req, res) => {
  try {
    const result = await deleteConversation({
      owner: req.user.id,
      conversationId: req.params.conversationId,
    });
    res.json(result);
  } catch (err) {
    handleError(res, err, "Failed to delete conversation");
  }
};

const postConversationMessage = async (req, res) => {
  try {
    const { stream } = req.body;

    if (stream) {
      setupSse(res);
      const abortController = new AbortController();
      req.on("close", () => abortController.abort());

      try {
        sendSseEvent(res, "start", { conversationId: req.params.conversationId });

        const result = await sendConversationMessage({
          owner: req.user.id,
          conversationId: req.params.conversationId,
          message: req.body.message,
          stream: true,
          onChunk: (token, meta) => {
            sendSseEvent(res, "token", { token, ...meta });
          },
          onFirstToken: (ttftMs) => {
            sendSseEvent(res, "ttft", { ttftMs });
          },
          signal: abortController.signal,
        });

        sendSseEvent(res, "done", result);
        res.end();
      } catch (err) {
        if (err.message === "Stream aborted") {
          sendSseEvent(res, "aborted", { message: "Generation stopped" });
          res.end();
          return;
        }

        sendSseEvent(res, "error", { error: err.message });
        res.end();
      }

      return;
    }

    const result = await sendConversationMessage({
      owner: req.user.id,
      conversationId: req.params.conversationId,
      message: req.body.message,
    });
    res.json(result);
  } catch (err) {
    handleError(res, err, "Failed to send message");
  }
};

module.exports = {
  getAnalysis,
  getModels,
  getAiMetrics,
  getAiStatus,
  getAiRoute,
  postStreamSkill,
  postExplainRun,
  postExplainDashboard,
  postExplainReport,
  postCompareRuns,
  postInvestigateIncident,
  postExecutiveBrief,
  postOptimizationAdvisor,
  postChaosAdvisor,
  postCapacityPlanner,
  postRunbook,
  postPostmortem,
  postAiReport,
  postWeeklyReview,
  postCreateConversation,
  getConversationById,
  getConversationList,
  patchConversation,
  deleteConversationById,
  postConversationMessage,
};
