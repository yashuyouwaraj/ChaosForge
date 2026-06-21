const skills = require("./all.skills");

const AI_SKILLS = {
  explainRun: () => skills.buildExplainRunInstruction(),
  explainDashboard: () => skills.buildExplainDashboardInstruction(),
  explainReport: () => skills.buildExplainReportInstruction(),
  compareRuns: () => skills.buildRunComparisonInstruction(),
  incidentInvestigator: () => skills.buildIncidentInvestigatorInstruction(),
  executiveBrief: () => skills.buildExecutiveBriefInstruction(),
  optimizationAdvisor: () => skills.buildOptimizationAdvisorInstruction(),
  chaosExperimentAdvisor: (payload = {}) =>
    skills.buildChaosExperimentAdvisorInstruction(payload.goal),
  capacityPlanner: () => skills.buildCapacityPlanningInstruction(),
  runbook: () => skills.buildRunbookInstruction(),
  postmortem: () => skills.buildPostmortemInstruction(),
  aiReportGenerator: () => skills.buildAiReportGeneratorInstruction(),
  weeklyInfrastructureReview: () =>
    skills.buildWeeklyInfrastructureReviewInstruction(),
  askChaosForge: (payload = {}) =>
    skills.buildAskChaosForgeInstruction(payload.message),
};

const buildSkillInstruction = (skill, payload = {}) => {
  const buildInstruction = AI_SKILLS[skill];

  if (!buildInstruction) {
    throw new Error(`Unknown AI skill: ${skill}`);
  }

  return buildInstruction(payload);
};

const listSkills = () => Object.keys(AI_SKILLS);

module.exports = {
  buildSkillInstruction,
  listSkills,
  AI_SKILLS,
};
