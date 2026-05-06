const Project = require("../modules/project/project.model");
const Run = require("../modules/run/run.model");

const verifyProjectOwnership = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }

  if (project.owner.toString() !== req.user.id) {
    return res.status(403).json({
      message: "Access denied. You do not own this project.",
    });
  }

  req.project = project;

  next();
};

const verifyRunOwnership = async (req, res, next) => {
  const run = await Run.findOne({ runId: req.params.runId });

  if (!run) {
    return res.status(404).json({
      message: "Run not found",
    });
  }

  if (run.owner.toString() !== req.user.id) {
    return res.status(403).json({
      message: "Access denied. You do not own this project.",
    });
  }

  req.run = run;
  next()
};

module.exports = {
  verifyProjectOwnership,
  verifyRunOwnership,
};
