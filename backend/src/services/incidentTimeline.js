const MAX_INCIDENTS = 200;

const incidentTimeline = [];

const addIncident = (incident) => {
  incidentTimeline.unshift({
    id: crypto.randomUUID(),

    timestamp: new Date().toISOString(),

    type: incident.type || "system",

    severity: incident.severity || "info",

    title: incident.title || "Infrastructure Event",

    message: incident.message || "",

    metadata: incident.metadata || {},
  });

  if (incidentTimeline.length > MAX_INCIDENTS) {
    incidentTimeline.pop();
  }
};

const getIncidentTimeline = () => {
  return incidentTimeline;
};

module.exports = {
  addIncident,

  getIncidentTimeline,
};
