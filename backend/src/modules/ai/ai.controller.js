const { getAiAnalysis } = require("./ai.service");

const getAnalysis = async (req, res) => {
  try {
    const { projectId, runId } = req.params;
    const analysis = await getAiAnalysis(projectId, runId);
    res.json(analysis);
  } catch (err) {
    console.error("Error in getAnalysis:", err);
    res.status(500).json({ error: "Failed to get AI analysis" });
  }
};

module.exports = {
  getAnalysis,
};
