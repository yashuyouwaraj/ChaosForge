const { buildHealth } = require("./engines/health.engine");
const { buildRisk } = require("./engines/risk.engine");
const { buildRootCause } = require("./engines/rootCause.engine");
const { buildRecommendations } = require("./engines/recommendation.engine");
const {
  buildTrends,
  buildHistoricalComparison,
  buildHistoricalIntelligence,
} = require("./engines/trend.engine");
const { buildDeploymentReadiness } = require("./engines/deploymentReadiness.engine");
const { buildOperationalInsights } = require("./engines/operationalInsights.engine");
const {
  buildExecutiveBrief,
  buildExecutiveSummary,
} = require("./engines/executive.engine");
const { buildInfrastructureHealth } = require("./engines/infrastructureHealth.engine");
const { buildResilience } = require("./engines/resilience.engine");
const { loadInfrastructureMemory } = require("./engines/memory.engine");

module.exports = {
  buildHealth,
  buildRisk,
  buildRootCause,
  buildRecommendations,
  buildTrends,
  buildHistoricalComparison,
  buildHistoricalIntelligence,
  buildDeploymentReadiness,
  buildOperationalInsights,
  buildExecutiveBrief,
  buildExecutiveSummary,
  buildInfrastructureHealth,
  buildResilience,
  loadInfrastructureMemory,
};
