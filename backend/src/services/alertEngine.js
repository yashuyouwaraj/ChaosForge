const {
  addIncident,
} = require("./incidentTimeline");

const INCIDENT_SEVERITIES = new Set([
  "warning",
  "critical",
]);

let activeIncidentKeys = new Set();
let hasLoggedStableState = false;

const getAlertKey = (alert) =>
  `${alert.type}:${alert.title}`;

const syncInfrastructureIncidents = (
  alerts,
) => {
  const currentIncidentAlerts =
    alerts.filter((alert) =>
      INCIDENT_SEVERITIES.has(
        alert.severity,
      ),
    );

  const currentIncidentKeys =
    new Set(
      currentIncidentAlerts.map(
        getAlertKey,
      ),
    );

  for (const alert of currentIncidentAlerts) {
    const alertKey =
      getAlertKey(alert);

    if (
      activeIncidentKeys.has(
        alertKey,
      )
    ) {
      continue;
    }

    addIncident(alert);
  }

  if (
    currentIncidentKeys.size ===
    0
  ) {
    if (
      !hasLoggedStableState ||
      activeIncidentKeys.size > 0
    ) {
      addIncident({
        type: "system",
        severity: "info",
        title:
          "Infrastructure Stable",
        message:
          "All monitored infrastructure systems operational.",
      });

      hasLoggedStableState = true;
    }
  } else {
    hasLoggedStableState = false;
  }

  activeIncidentKeys =
    currentIncidentKeys;
};

const evaluateInfrastructureAlerts = (
  health,
) => {
  const alerts = [];

  /*
   * REDIS
   */

  if (
    health.redis !==
    "connected"
  ) {
    alerts.push({
      type: "redis",

      severity:
        "critical",

      title:
        "Redis Failure",

      message:
        "Redis connection lost.",
    });
  }

  /*
   * KAFKA
   */

  if (
    health.kafka !==
    "connected"
  ) {
    alerts.push({
      type: "kafka",

      severity:
        "critical",

      title:
        "Kafka Failure",

      message:
        "Kafka unavailable.",
    });
  }

  /*
   * MEMORY
   */

  if (
    health.memory
      ?.heapUsed >
    300 * 1024 * 1024
  ) {
    alerts.push({
      type: "memory",

      severity:
        "warning",

      title:
        "High Memory Usage",

      message:
        "Backend memory pressure elevated.",
    });
  }

  /*
   * CONCURRENCY
   */

  if (
    health.activeRuns >
    10
  ) {
    alerts.push({
      type:
        "simulation",

      severity:
        "warning",

      title:
        "High Simulation Concurrency",

      message:
        "Large number of concurrent simulations detected.",
    });
  }

  /*
   * WEBSOCKETS
   */

  if (
    health.websockets
      ?.connectedClients ===
    0
  ) {
    alerts.push({
      type:
        "websocket",

      severity: "info",

      title:
        "No Active Websocket Clients",

      message:
        "Realtime telemetry stream currently idle.",
    });
  }

  syncInfrastructureIncidents(
    alerts,
  );

  return alerts;
};

module.exports = {
  evaluateInfrastructureAlerts,
};
