const projectService = require("./project.service");
const { generateTraffic } = require("../../services/traffic.service");
const {
  emitBufferedLog,
  getIO,
} = require("../../websocket/socket");
const User = require("../user/user.model");
const Run = require("../run/run.model");
const { success, error } = require("../../utils/response");
const logger = require("../../utils/logger");
const { v4: uuidv4 } = require("uuid");
const { initControl } = require("../../control/control.store");
const { markRunComplete } = require("../../metrics/metrics.store");

const createProject = async (req, res) => {
  const { name } = req.body;
  const project = await projectService.create(name, req.user.id);

  return res.json(project);
};

const getProjects = async (req, res) => {
  const projects = await projectService.getAll(req.user.id);

  res.json(projects);
};

const getProject = async (req, res) => {
  const project = req.project || (await projectService.getOne(req.params.id));

  if (!project) {
    return error(res, "Project not found", 404);
  }
  return success(res, project);
};

const runProjectTraffic = async (req, res) => {
  const url = req.query.url || "https://jsonplaceholder.typicode.com/posts";
  const { id } = req.params;
  const count = Number.parseInt(req.query.count || "10", 10);
  const rate = req.query.rate || 50;
  const user = await User.findOne({ email: req.user.email });

  if (!Number.isInteger(count) || count <= 0) {
    return res.status(400).json({ message: "Count must be a positive number" });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.plan === "free" && count > 50) {
    return res.status(403).json({
      message: "Upgrade to Pro for traffic counts above 50",
    });
  }

  const project = req.project || (await projectService.getOne(id));

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (project.owner.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not your project" });
  }

  const runId = uuidv4();
  await initControl(id, runId);
  const runConfig = {
    pattern: "requests",
    totalRequests: count,
    rate: Number.parseInt(rate, 10) || 50,
  };

  await Run.create({
    owner: req.user.id,
    projectId: id,
    runId,
    status: "starting",
    config: runConfig,
    url,
  });

  const startLog = {
    projectId: id,
    requestId: req.requestId,
    message: `Starting ${count} requests`,
    type: "info",
    level: "info",
    time: new Date().toLocaleTimeString(),
  };

  emitBufferedLog(id, runId, startLog);
  getIO().emit("project-log", startLog);

  generateTraffic(
    runConfig,
    id,
    url,
    { runId, controlInitialized: true, owner: req.user.id },
  )
    .then(() => {
      getIO().emit(`complete-${id}-${runId}`);
    })
    .catch((err) => {
      logger.error({
        message: "Traffic simulation failed",
        projectId: id,
        runId,
        error: err.message,
      });

      Run.findOneAndUpdate(
        { projectId: id, runId },
        { status: "failed" },
      ).catch((error) => {
        logger.error({
          message: "Failed to mark run as failed",
          projectId: id,
          runId,
          error: error.message,
        });
      });

      markRunComplete(runId);

      emitBufferedLog(id, runId, {
        projectId: id,
        requestId: req.requestId,
        message: err.message || "Traffic simulation failed",
        type: "error",
        level: "error",
        time: new Date().toLocaleTimeString(),
      });
    });

  return res.json({
    message: `Traffic queued for project ${id}`,
    runId,
    status: "starting",
  });
};

module.exports = { createProject, getProjects, getProject, runProjectTraffic };
