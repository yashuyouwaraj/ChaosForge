const {
  FAST_SKILLS,
  DEEP_SKILLS,
  FALLBACK_CHAIN,
  getModelByKey,
} = require("../models/ai.model");

const SKILL_MODEL_MAP = {
  explainRun: "super",
  explainDashboard: "super",
  explainReport: "super",
  compareRuns: "super",
  askChaosForge: "super",
  incidentInvestigator: "ultra",
  capacityPlanner: "ultra",
  chaosExperimentAdvisor: "ultra",
  executiveBrief: "ultra",
  weeklyInfrastructureReview: "ultra",
  runbook: "ultra",
  optimizationAdvisor: "ultra",
  postmortem: "ultra",
  aiReportGenerator: "ultra",
};

const MODE_MODEL_MAP = {
  fast: "super",
  balanced: null,
  deep: "ultra",
};

const resolveSkillModel = (skill) => SKILL_MODEL_MAP[skill] || "super";

const resolveModeModel = (mode, skill) => {
  if (mode === "automatic" || mode === "balanced") {
    if (DEEP_SKILLS.has(skill)) {
      return "ultra";
    }

    if (FAST_SKILLS.has(skill)) {
      return "super";
    }

    return resolveSkillModel(skill);
  }

  if (mode === "fast") {
    return "super";
  }

  if (mode === "deep") {
    return "ultra";
  }

  return null;
};

const resolveModelRoute = ({ skill, mode = "automatic", customModel = null }) => {
  let preferredModel = null;
  let routingSource = "skill";

  if (mode === "custom" && customModel) {
    preferredModel = customModel;
    routingSource = "custom";
  } else if (mode && mode !== "automatic") {
    preferredModel = resolveModeModel(mode, skill);
    routingSource = "mode";
  }

  if (!preferredModel) {
    preferredModel = resolveSkillModel(skill);
    routingSource = "skill";
  }

  const fallbackModels = FALLBACK_CHAIN.filter(
    (modelKey) => modelKey !== preferredModel,
  );

  const preferred = getModelByKey(preferredModel);

  return {
    skill,
    mode,
    preferredModel,
    preferredModelId: preferred?.id || null,
    preferredDisplayName: preferred?.displayName || preferredModel,
    reasoning: preferred?.reasoning === "high",
    supportsStreaming: preferred?.supportsStreaming !== false,
    fallbackModels,
    routingSource,
    routeChain: [preferredModel, ...fallbackModels],
  };
};

const getSkillRoutingTable = () =>
  Object.entries(SKILL_MODEL_MAP).map(([skill, model]) => ({
    skill,
    preferredModel: model,
    category: FAST_SKILLS.has(skill) ? "fast" : "deep",
  }));

module.exports = {
  SKILL_MODEL_MAP,
  resolveSkillModel,
  resolveModeModel,
  resolveModelRoute,
  getSkillRoutingTable,
};
