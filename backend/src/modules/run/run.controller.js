const { getRunsByProject } = require("./run.service");
const logger = require("../../utils/logger");

const getRuns = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const runs = await getRunsByProject(projectId);
    
    return res.json(runs);
  } catch (err) {
    logger.error({
      message: "Error fetching runs",
      error: err.message,
      projectId: req.params.projectId,
    });
    return res.status(500).json({ error: "Failed to fetch runs" });
  }
};

module.exports = { getRuns };
