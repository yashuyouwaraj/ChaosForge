const MAX_INCIDENTS = 100;

const incidentTimeline = [];

const addIncident = (incident) => {
  incidentTimeline.unshift({ ...incident, timestamp: new Date().toISOString });

  if (incidentTimeline.length > MAX_INCIDENTS) {
    incidentTimeline.pop();
  }
};

const getIncidentTimeline = () => {
  return incidentTimeline;
};

module.exports = { addIncident, getIncidentTimeline };
