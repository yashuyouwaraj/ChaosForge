const Project = require("./project.model");
const Run = require("../run/run.model");
const InfrastructureMemory = require("../memory/memory.model");
const plans = require("../../config/plan");
const { removeIncidentsByProjects } = require("../../services/incidentTimeline");
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

const updateOneForOwner = async (id, owner, updates = {}) => {
  const name = String(updates.name || "").trim();

  if (!name) {
    const error = new Error("Project name is required.");
    error.statusCode = 400;
    throw error;
  }

  const project = await Project.findOneAndUpdate(
    { _id: id, owner },
    { $set: { name } },
    { new: true, runValidators: true },
  );

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  if (projectCache[owner]) {
    delete projectCache[owner];
  }

  return project;
};

const deleteOneForOwner = async (id, owner) => {
  const project = await Project.findOne({ _id: id, owner }).select("_id");

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const projectId = project._id.toString();

  const [projectResult, runResult] = await Promise.all([
    Project.deleteOne({ _id: projectId, owner }),
    Run.deleteMany({ owner, projectId }),
    InfrastructureMemory.deleteMany({ projectId }),
  ]);

  removeIncidentsByProjects([projectId]);

  if (projectCache[owner]) {
    delete projectCache[owner];
  }

  return {
    success: true,
    deletedProjects: projectResult.deletedCount || 0,
    deletedRuns: runResult.deletedCount || 0,
  };
};

const deleteAllForOwner = async (owner) => {
  const projects = await Project.find({ owner }).select("_id");
  const projectIds = projects.map((project) => project._id.toString());

  const [projectResult, runResult] = await Promise.all([
    Project.deleteMany({ owner }),
    Run.deleteMany({
      owner,
      projectId: { $in: projectIds },
    }),
    InfrastructureMemory.deleteMany({
      projectId: { $in: projectIds },
    }),
  ]);

  removeIncidentsByProjects(projectIds);

  if (projectCache[owner]) {
    delete projectCache[owner];
  }

  return {
    success: true,
    deletedProjects: projectResult.deletedCount || 0,
    deletedRuns: runResult.deletedCount || 0,
  };
};

module.exports = {
  create,
  getAll,
  getOne,
  updateOneForOwner,
  deleteOneForOwner,
  deleteAllForOwner,
};
