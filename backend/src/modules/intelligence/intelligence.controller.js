const { buildRunIntelligence } = require("./intelligence.service");

const getIntelligence = async (req, res) => {
  try {
    const { projectId, runId } = req.params;
    const intelligence = await buildRunIntelligence({ projectId, runId });
    res.json(intelligence);
  } catch (err) {
    console.error("Error in getIntelligence:", err);
    res.status(500).json({ error: "Failed to get intelligence analysis" });
  }
};

module.exports = {
  getIntelligence,
};
