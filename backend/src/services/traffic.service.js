const producer = require("../config/kafka");
const logger = require("../utils/logger");

const generateTraffic = async (count = 10, projectId, requestId) => {
  await producer.connect();

  for (let i = 0; i < count; i++) {
    await producer.send({
      topic: "traffic-topic",
      messages: [
        {
          value: JSON.stringify({
            requestId,
            projectId,
            request: `Request-${i + 1}`,
          }),
        },
      ],
    });
  }

  logger.info({
    requestId,
    message: `Sent ${count} messages to Kafka`,
  });

  await producer.disconnect();
};

module.exports = { generateTraffic };
