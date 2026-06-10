const Project = require("./project.model");
const plans = require("../../config/plan");
let projectCache = {};

const create = async (name, owner, plan = "free") => {
  const limits = plans[plan] || plans.free;
  const existingCount = await Project.countDocuments({ owner });

  if (existingCount >= limits.maxProjects) {
    const error = new Error(
      `Your ${plan} plan supports up to ${limits.maxProjects} projects.`,
    );
    error.statusCode = 403;
    error.code = "PROJECT_LIMIT_EXCEEDED";
    error.details = {
      currentPlan: plan,
      currentLimit: limits.maxProjects,
      currentProjects: existingCount,
      proLimit: plans.pro?.maxProjects || 100,
    };
    throw error;
  }

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
