const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { simulateProcessing } = require("./simulation.service");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateTraffic = async (total,projectId, url, rate=50) => {

  const batchSize = rate; // Number of requests per batch
  const tatalBatches = Math.ceil(total / batchSize)

  logger.info({
    message: `Starting controlled load: ${total} requests at ${rate}/sec`,
    projectId,
  });

  for(let b = 0; b < tatalBatches; b++) {
    const promises = [];
    for (let i = 0; i < batchSize && (b * batchSize + i) < total; i++) {
      const requestId = uuidv4();
      promises.push(
        simulateProcessing(url, requestId, projectId)
      );
    }
    await Promise.all(promises);

    await delay(1000); // Wait for 1 second before the next batch
  }

  logger.info({
    message: `Completed controlled load`,
    projectId,
  });
};

module.exports = { generateTraffic };