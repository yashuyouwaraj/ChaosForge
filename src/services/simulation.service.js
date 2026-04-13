const {recordRequest} = require("../metrics/metrics.store");
const logger = require("../utils/logger");

const simulateProcessing = async (message,requestId) => {
  const start = Date.now();

  logger.info({
    requestId,
    message:`Processing ${message}`
  })

  //simulate delay (0-2 sec)
  const delay = Math.random()*2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

   // simulate failure (30% chance)
  const fail = Math.random()<0.3;

  const latency = Date.now() - start;

  if (fail) {
    logger.error({ requestId, message: `Failed ${message}` });
    recordRequest(latency, false);
    return;
  }
  logger.info({ requestId, message: `Success ${message}` });
  recordRequest(latency, true);
};

module.exports = { simulateProcessing };
