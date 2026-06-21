const {
  buildRunIntelligence,
  buildLegacyAiAnalysis,
} = require("../intelligence/intelligence.service");

const getAiAnalysis = async (projectId, runId) => {
  const intelligence = await buildRunIntelligence({ projectId, runId });
  return buildLegacyAiAnalysis(intelligence);
};

module.exports = {
  getAiAnalysis,
};
