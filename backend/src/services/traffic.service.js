const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { simulateProcessing } = require("./simulation.service");
const { producer } = require("../config/kafka");
const { emitBufferedLog } = require("../websocket/socket");

const useKafka = process.env.USE_KAFKA === "true";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateTraffic = async (total, projectId, url, rate = 50) => {
  const requestCount = Number.parseInt(total, 10);
  const requestsPerSecond = Number.parseInt(rate, 10);

  if (!Number.isInteger(requestCount) || requestCount <= 0) {
    return;
  }

  const batchSize = Number.isInteger(requestsPerSecond) && requestsPerSecond > 0
    ? requestsPerSecond
    : 50;

  if (!useKafka) {
    const totalBatches = Math.ceil(requestCount / batchSize);

    logger.info({
      message: `Starting controlled load: ${requestCount} requests at ${batchSize}/sec`,
      projectId,
    });

    for (let batch = 0; batch < totalBatches; batch++) {
      const promises = [];

      for (
        let i = 0;
        i < batchSize && (batch * batchSize + i) < requestCount;
        i++
      ) {
        promises.push(simulateProcessing(url, uuidv4(), projectId));
      }

      await Promise.all(promises);

      if (batch < totalBatches - 1) {
        await delay(1000);
      }
    }

    emitBufferedLog(projectId, {
      requestId: uuidv4(),
      message: `Completed ${requestCount} requests`,
      type: "complete",
      time: new Date().toLocaleTimeString(),
    });

    logger.info({
      message: "Completed controlled load",
      projectId,
    });

    return;
  }

  await producer.connect();

  for(let i = 0; i < requestCount; i++){
    await producer.send({
      topic:"traffic-topic",
      messages:[
        {
          key: projectId,
          value:JSON.stringify({
            projectId,
            url,
            requestId: uuidv4(),
          })
        }
      ]
    })
  }

  await producer.send({
    topic: "traffic-topic",
    messages: [
      {
        key: projectId,
        value: JSON.stringify({
          type: "traffic-complete",
          projectId,
          total: requestCount,
          requestId: uuidv4(),
        }),
      },
    ],
  });

  await producer.disconnect();
};

module.exports = { generateTraffic };
