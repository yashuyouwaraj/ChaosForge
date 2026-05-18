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

const getRunLogsEvent = (
  projectId,
  runId,
) =>
  `logs-${projectId}-${runId}`;

module.exports = {
  PLATFORM_EVENTS,

  getRunLogsEvent,
};