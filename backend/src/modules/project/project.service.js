const { v4: uuidv4 } = require("uuid");
const Project = require("./project.model");

const create = async (name, owner) => {
  const project = new Project({name, owner})
  return await project.save();
};

const getAll = async (owner) => {
  return await Project.find({ owner });
};

const getOne = async (id) => {
  return await Project.findById(id);
};

module.exports = { create, getAll, getOne };
