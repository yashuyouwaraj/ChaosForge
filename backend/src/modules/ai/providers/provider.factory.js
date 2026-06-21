const NvidiaProvider = require("./nvidia.provider");
const { AI_PROVIDER } = require("../config/ai.config");
const { resolveAiSettings } = require("../prompt/context.builder");
const { resolveModelRoute } = require("../router/ai.router");

const createProvider = async (owner = null, { skill, modelOverride = null } = {}) => {
  const settings = await resolveAiSettings(owner);
  const route = resolveModelRoute({
    skill: skill || "explainRun",
    mode: settings.mode || "automatic",
    customModel: settings.mode === "custom" ? settings.model : null,
  });

  const modelKey = modelOverride || route.preferredModel;

  switch (settings.provider || AI_PROVIDER) {
    case "nvidia":
      return new NvidiaProvider({
        model: modelKey,
        route,
        settings,
      });

    default:
      throw new Error(`Unsupported AI provider: ${settings.provider}`);
  }
};

module.exports = {
  createProvider,
};
