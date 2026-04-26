const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { simulateProcessing } = require("./simulation.service");

const generateTraffic = async (count = 10, projectId, url) => {

  const promises = [];

  for (let i = 0; i < count; i++) {
    const requestId = uuidv4();

    promises.push(
      simulateProcessing(url, requestId, projectId)
    );
  }

  await Promise.all(promises); // 💀 parallel execution

  logger.info({
    message: `Executed ${count} real HTTP requests`,
    projectId,
  });
};

module.exports = { generateTraffic };