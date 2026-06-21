const InfrastructureMemory = require("../../memory/memory.model");

const normalizePattern = (pattern = {}) => ({
  patternType: pattern.patternType || "unknown",
  severity: pattern.severity || "info",
  trend: pattern.trend || "stable",
  confidence: pattern.confidence || 0,
  title: pattern.title || "Infrastructure Pattern",
  description: pattern.description || "",
  recommendation: pattern.recommendation || "",
  detectionCount: pattern.detectionCount || 1,
  firstDetectedAt: pattern.firstDetectedAt || null,
  lastDetectedAt: pattern.lastDetectedAt || null,
  runId: pattern.runId || null,
});

const loadInfrastructureMemory = async (projectId) => {
  const memory = await InfrastructureMemory.find({ projectId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  const patterns = memory.map(normalizePattern);

  return {
    totalPatterns: patterns.length,
    patterns,
  };
};

module.exports = {
  loadInfrastructureMemory,
  normalizePattern,
};
