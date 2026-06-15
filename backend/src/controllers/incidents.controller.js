const { getIncidentTimeline } = require("../services/incidentTimeline");

const getAllIncidents = async (req, res) => {
  try {
    const incidents = getIncidentTimeline();
    return res.json(incidents);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Failed to load incidents",
    });
  }
};

const getRunIncidents = async (req, res) => {
  try {
    const { runId } = req.params;

    const incidents = getIncidentTimeline().filter(
      (incident) => incident?.metadata?.runId === runId,
    );

    return res.json(incidents);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Failed to load incidents",
    });
  }
};

module.exports = { getAllIncidents, getRunIncidents };
