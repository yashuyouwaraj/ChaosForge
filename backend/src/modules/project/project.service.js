const { v4: uuidv4 } = require("uuid");
const Project = require("./project.model");
let projectCache = {};

const create = async (name, owner) => {
  const project = new Project({ name, owner });
  const savedProject = await project.save();

  // invalidate cached project lists for this owner so subsequent reads reflect the new project
  if (projectCache[owner]) {
    delete projectCache[owner];
  }

  return savedProject;
};

const getAll = async (owner) => {
  if (projectCache[owner]) {
    return projectCache[owner];
  }

  const projects = await Project.find({ owner });
  projectCache[owner] = projects;
  return projects;
};

const getOne = async (id) => {
  return await Project.findById(id);
};

module.exports = { create, getAll, getOne };
