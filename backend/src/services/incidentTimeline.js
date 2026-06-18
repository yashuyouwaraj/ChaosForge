const MAX_INCIDENTS = 200;

const incidentTimeline = [];

const isSimulationLifecycleEvent = (incident) =>
  ["Simulation Started", "Simulation Completed"].includes(incident.title);

const hasDuplicateLifecycleEvent = (incident) => {
  if (!isSimulationLifecycleEvent(incident)) {
    return false;
  }

  const runId = incident.metadata?.runId;

  if (!runId) {
    return false;
  }

  return incidentTimeline.some(
    (existing) =>
      existing.title === incident.title &&
      existing.metadata?.runId === runId,
  );
};

const addIncident = (incident) => {
  if (hasDuplicateLifecycleEvent(incident)) {
    return;
  }

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

const removeIncidentsByProjects = (projectIds) => {
  const projectIdSet = new Set(projectIds.map(String));
  let deleted = 0;

  for (let index = incidentTimeline.length - 1; index >= 0; index -= 1) {
    const incidentProjectId = incidentTimeline[index]?.metadata?.projectId;

    if (incidentProjectId && projectIdSet.has(String(incidentProjectId))) {
      incidentTimeline.splice(index, 1);
      deleted += 1;
    }
  }

  return deleted;
};

module.exports = {
  addIncident,

  getIncidentTimeline,

  removeIncidentsByProjects,
};
