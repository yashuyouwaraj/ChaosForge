const projectService = require("./project.service");
const { generateTraffic } = require("../../services/traffic.service");
const { findUserByEmail } = require("../user/user.model");
const { getIO } = require("../../websocket/socket");

const createProject = (req, res) => {
  const { name } = req.body;
  const project = projectService.create(name, req.user.email);

  return res.json(project);
};

const getProjects = (req, res) => {
  const projects = projectService.getAll(req.user.email);

  return res.json(projects);
};

const getProject = (req, res) => {
  const project = projectService.getOne(req.params.id);

  return res.json(project);
};

const runProjectTraffic = async (req, res) => {
  const { id } = req.params;
  const count = Number.parseInt(req.query.count || "10", 10);
  const user = findUserByEmail(req.user.email);

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

  const project = projectService.getOne(id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (project.owner !== req.user.email) {
    return res.status(403).json({ message: "Not your project" });
  }

  const startLog = {
    projectId: id,
    requestId: req.requestId,
    message: `Starting ${count} requests`,
    type: "info",
    time: new Date().toLocaleTimeString(),
  };

  getIO().emit(`logs-${id}`, startLog);
  getIO().emit("project-log", startLog);

  await generateTraffic(count, id, req.requestId);

  return res.json({ message: `Traffic started for project ${id}` });
};

module.exports = { createProject, getProjects, getProject, runProjectTraffic };
