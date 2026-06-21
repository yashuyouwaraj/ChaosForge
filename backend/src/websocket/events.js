const PLATFORM_EVENTS = {
  INFRASTRUCTURE_ALERTS:
    "infrastructure-alerts",

  INCIDENT_TIMELINE:
    "incident-timeline",

  AI_INSIGHTS:
    "ai-insights",

  SYSTEM_HEALTH:
    "system-health",

  PLATFORM_ACTIVITY:
    "platform-activity",
};

const INTELLIGENCE_UPDATE_EVENT = "intelligence:update";

const getRunLogsEvent = (
  projectId,
  runId,
) =>
  `logs-${projectId}-${runId}`;

module.exports = {
  PLATFORM_EVENTS,
  INTELLIGENCE_UPDATE_EVENT,

  getRunLogsEvent,
};