const { addIncident } = require("./incidentTimeline");

const evaluateInfrastructureAlerts = (health) => {
  const alerts = [];

  if (health.redis !== "connected") {
    const incident = {
      severity: "critical",
      message: "Redis disconnected",
    };
    alerts.push(incident);

    addIncident(incident);
  }

  if (health.kafka !== "connected") {
    const incident = {
      severity: "critical",

      message: "Kafka unavailable",
    };
    alerts.push(incident);

    addIncident(incident);
  }

  if (health.memory?.heapUsed > 300 * 1024 * 1024) {
    const incident = {
      severity: "warning",

      message: "High memory usage detected",
    };
    alerts.push(incident);

    addIncident(incident);
  }

  if (health.activeRuns > 10) {
    const incident = {
      severity: "warning",

      message: "High simulation concurrency",
    };
    alerts.push(incident);

    addIncident(incident);
  }

  if (health.websockets?.connectedClients === 0) {
    const incident = {
      severity: "info",

      message: "No websocket clients connected",
    };
    alerts.push(incident);

    addIncident(incident);
  }

  return alerts;
};

module.exports = {
  evaluateInfrastructureAlerts,
};
