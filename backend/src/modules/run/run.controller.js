const { getRunsByProject } = require("./run.service");
const logger = require("../../utils/logger");
const Run = require("./run.model");
const {compareRuns} = require("./run.compare.service")

const getRuns = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const runs = await getRunsByProject(projectId, req.user.id);
    
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

const compare = async(req,res)=>{
    const {runA, runB} = req.query;

    const [A, B] = await Promise.all([
        Run.findOne({ runId: runA }),
        Run.findOne({ runId: runB }),
    ])

    if(!A || !B){
        return res.status(404).json({error: "One or both runs not found"})
    }

    if (A.owner.toString() !== req.user.id || B.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: "Access denied. You do not own this project." });
    }

    const comparison = compareRuns(A.toObject(), B.toObject());

    return res.json(comparison);
}

module.exports = { getRuns, compare };
