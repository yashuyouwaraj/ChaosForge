const Run = require("./run.model");
const logger = require("../../utils/logger");

const saveRun = async (data) => {
  try {
    return await Run.create(data);
  } catch (err) {
    logger.error({
      message: "Error saving run",
      error: err.message,
      data,
    });
    throw err;
  }
};

const getRunsByProject = async (projectId) => {
  try {
    return await Run.find({ projectId }).sort({ createdAt: -1 });
  } catch (err) {
    logger.error({
      message: "Error fetching runs",
      error: err.message,
      projectId,
    });
    throw err;
  }
};

module.exports = {
  saveRun,
  getRunsByProject,
};
