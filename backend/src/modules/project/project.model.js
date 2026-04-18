let projects = [];

const createProject = (project) => {
  projects.push(project);
  return project;
};

const getProjectsByUser = (email) => {
  return projects.filter((p) => p.owner === email);
};

const getProjectById = (id) => {
  return projects.find((p) => p.id === id);
};


module.exports = { createProject, getProjectsByUser, getProjectById };