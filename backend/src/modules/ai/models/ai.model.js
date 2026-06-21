const NVIDIA_MODELS = {
  ultra: {
    id: "nvidia/nemotron-3-ultra-550b-a55b",
    displayName: "Nemotron Ultra",
    description:
      "Flagship reasoning model for deep infrastructure analysis, incident investigation, and executive reporting.",
    provider: "nvidia",
    category: "reasoning",
    reasoning: "high",
    speed: "slow",
    recommendedUse: "Incident investigation, capacity planning, executive briefs, runbooks",
    contextWindow: 128000,
    supportsStreaming: true,
    supportsThinking: true,
    supportsReasoningBudget: true,
    supportsStructuredOutput: true,
    supportsTools: true,
    status: "active",
    costPer1MInput: 4.0,
    costPer1MOutput: 16.0,
  },

  super: {
    id: "nvidia/nemotron-3-super-120b-a12b",
    displayName: "Nemotron Super",
    description:
      "Balanced model for fast operational explanations, run comparisons, and conversational copilot.",
    provider: "nvidia",
    category: "general",
    reasoning: "medium",
    speed: "fast",
    recommendedUse: "Explain run, dashboard, report, compare runs, Ask ChaosForge",
    contextWindow: 128000,
    supportsStreaming: true,
    supportsThinking: false,
    supportsReasoningBudget: false,
    supportsStructuredOutput: true,
    supportsTools: true,
    status: "active",
    costPer1MInput: 1.0,
    costPer1MOutput: 4.0,
  },

  llama70b: {
    id: "meta/llama-3.3-70b-instruct",
    displayName: "Llama 3.3 70B",
    description:
      "Reliable fallback model when primary NVIDIA models are unavailable.",
    provider: "nvidia",
    category: "general",
    reasoning: "medium",
    speed: "fast",
    recommendedUse: "Fallback for all skills",
    contextWindow: 128000,
    supportsStreaming: true,
    supportsThinking: false,
    supportsReasoningBudget: false,
    supportsStructuredOutput: true,
    supportsTools: false,
    status: "active",
    costPer1MInput: 0.35,
    costPer1MOutput: 0.4,
  },

  llama405b: {
    id: "meta/llama-3.1-405b-instruct",
    displayName: "Llama 3.1 405B",
    description: "Large open model for complex reasoning tasks.",
    provider: "nvidia",
    category: "reasoning",
    reasoning: "high",
    speed: "medium",
    recommendedUse: "Deep analysis alternative",
    contextWindow: 128000,
    supportsStreaming: true,
    supportsThinking: false,
    supportsReasoningBudget: false,
    supportsStructuredOutput: true,
    supportsTools: true,
    status: "active",
    costPer1MInput: 2.0,
    costPer1MOutput: 2.0,
  },

  mistralNemo: {
    id: "nv-mistralai/mistral-nemo-12b-instruct",
    displayName: "Mistral Nemo 12B",
    description: "Lightweight model for ultra-fast responses.",
    provider: "nvidia",
    category: "fast",
    reasoning: "low",
    speed: "fastest",
    recommendedUse: "Fast mode, simple Q&A",
    contextWindow: 128000,
    supportsStreaming: true,
    supportsThinking: false,
    supportsReasoningBudget: false,
    supportsStructuredOutput: true,
    supportsTools: false,
    status: "active",
    costPer1MInput: 0.15,
    costPer1MOutput: 0.15,
  },

  phi35: {
    id: "microsoft/phi-3.5-mini-instruct",
    displayName: "Phi-3.5 Mini",
    description: "Compact model for low-latency copilot interactions.",
    provider: "nvidia",
    category: "fast",
    reasoning: "low",
    speed: "fastest",
    recommendedUse: "Fast mode, lightweight chat",
    contextWindow: 128000,
    supportsStreaming: true,
    supportsThinking: false,
    supportsReasoningBudget: false,
    supportsStructuredOutput: true,
    supportsTools: false,
    status: "active",
    costPer1MInput: 0.1,
    costPer1MOutput: 0.1,
  },

  deepseekR1: {
    id: "deepseek-ai/deepseek-r1",
    displayName: "DeepSeek R1",
    description: "Reasoning model with chain-of-thought capabilities.",
    provider: "nvidia",
    category: "reasoning",
    reasoning: "high",
    speed: "medium",
    recommendedUse: "Deep reasoning, root cause analysis",
    contextWindow: 128000,
    supportsStreaming: true,
    supportsThinking: true,
    supportsReasoningBudget: true,
    supportsStructuredOutput: true,
    supportsTools: false,
    status: "active",
    costPer1MInput: 2.0,
    costPer1MOutput: 8.0,
  },

  qwen25: {
    id: "qwen/qwen2.5-72b-instruct",
    displayName: "Qwen 2.5 72B",
    description: "Strong multilingual model for operational analysis.",
    provider: "nvidia",
    category: "general",
    reasoning: "medium",
    speed: "fast",
    recommendedUse: "General analysis, comparisons",
    contextWindow: 128000,
    supportsStreaming: true,
    supportsThinking: false,
    supportsReasoningBudget: false,
    supportsStructuredOutput: true,
    supportsTools: true,
    status: "active",
    costPer1MInput: 0.6,
    costPer1MOutput: 0.6,
  },
};

const AI_MODES = {
  automatic: {
    id: "automatic",
    label: "Automatic (Recommended)",
    description: "Route by skill — fast skills use Nemotron Super, deep reasoning uses Nemotron Ultra.",
  },
  fast: {
    id: "fast",
    label: "Fast",
    description: "Prioritize speed with Nemotron Super or lightweight models.",
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    description: "Skill-aware routing with balanced speed and quality.",
  },
  deep: {
    id: "deep",
    label: "Deep Reasoning",
    description: "Always use Nemotron Ultra for maximum analysis depth.",
  },
  custom: {
    id: "custom",
    label: "Custom",
    description: "Use your selected model for all skills.",
  },
};

const FAST_SKILLS = new Set([
  "explainRun",
  "explainDashboard",
  "explainReport",
  "compareRuns",
  "askChaosForge",
]);

const DEEP_SKILLS = new Set([
  "incidentInvestigator",
  "capacityPlanner",
  "chaosExperimentAdvisor",
  "executiveBrief",
  "weeklyInfrastructureReview",
  "runbook",
  "optimizationAdvisor",
  "postmortem",
  "aiReportGenerator",
]);

const FALLBACK_CHAIN = ["llama70b"];

const getModelByKey = (key) => NVIDIA_MODELS[key] || null;

const getModelId = (key) => NVIDIA_MODELS[key]?.id || null;

const listModelRegistry = () =>
  Object.entries(NVIDIA_MODELS).map(([key, model]) => ({
    id: key,
    ...model,
  }));

const estimateCost = (modelKey, usage = {}) => {
  const model = NVIDIA_MODELS[modelKey];

  if (!model || !usage) {
    return 0;
  }

  const inputTokens = usage.prompt_tokens || usage.input_tokens || 0;
  const outputTokens = usage.completion_tokens || usage.output_tokens || 0;

  return (
    (inputTokens / 1_000_000) * (model.costPer1MInput || 0) +
    (outputTokens / 1_000_000) * (model.costPer1MOutput || 0)
  );
};

module.exports = {
  NVIDIA_MODELS,
  AI_MODES,
  FAST_SKILLS,
  DEEP_SKILLS,
  FALLBACK_CHAIN,
  getModelByKey,
  getModelId,
  listModelRegistry,
  estimateCost,
};
