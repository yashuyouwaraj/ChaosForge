const InfrastructureMemory = require("./memory.model");

const getProjectMemory = async (projectId) => {
  return InfrastructureMemory.find({ projectId }).sort({ createdAt: -1 });
};

const saveMemory = async (memory) => {
  return InfrastructureMemory.create(memory);
};

module.exports = {
  getProjectMemory,
  saveMemory,
};
