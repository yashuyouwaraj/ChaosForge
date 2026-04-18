const projectService = require("./project.service");

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

module.exports = { createProject, getProjects, getProject };
