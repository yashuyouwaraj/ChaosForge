const projectService = require("./project.service");
const { generateTraffic } = require("../../services/traffic.service");
const { getIO } = require("../../websocket/socket");
const User = require("../user/user.model");
const { success, error } = require("../../utils/response");

const createProject = async (req, res) => {
  const { name } = req.body;
  const project = await projectService.create(name, req.user.email);

  return res.json(project);
};

const getProjects = async (req, res) => {
  const projects = await projectService.getAll(req.user.email);

  res.json(projects);
};

const getProject = async (req, res) => {
  const project = await projectService.getOne(req.params.id);

  if (!project) {
    return error(res, "Project not found", 404);
  }
  if (project.owner !== req.user.email) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return success(res, project);
};

const runProjectTraffic = async (req, res) => {
  const url = req.query.url || "https://jsonplaceholder.typicode.com/posts";
  const { id } = req.params;
  const count = Number.parseInt(req.query.count || "10", 10);
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

  const project = await projectService.getOne(id);

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

  await generateTraffic(count, id, url);

  return res.json({ message: `Traffic started for project ${id}` });
};

module.exports = { createProject, getProjects, getProject, runProjectTraffic };
