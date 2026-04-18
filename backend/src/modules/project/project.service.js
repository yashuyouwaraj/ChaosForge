const { v4: uuidv4 } = require("uuid");

const {
  createProject,
  getProjectsByUser,
  getProjectById,
} = require("./project.model");

const create = (name, owner) => {
  return createProject({ id: uuidv4(), name, owner, createdAt: new Date() });
};

const getAll = (owner) => {
  return getProjectsByUser(owner);
};

const getOne = (id) => {
  return getProjectById(id);
};

module.exports = { create, getAll, getOne };
