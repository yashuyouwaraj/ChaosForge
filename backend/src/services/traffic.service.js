const producer = require("../config/kafka");
const logger = require("../utils/logger");

const generateTraffic = async (count = 10,projectId, requestId) => {
  await producer.connect();

  const messages = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      value: JSON.stringify({
        requestId,
        projectId,
        request: `Request-${i + 1}`,
      }),
    });
  }

  await producer.send({
    topic: "test-topic",
    messages,
  });

  logger.info({
    requestId,
    message: `Sent ${count} messages to Kafka`,
  });

  await producer.disconnect();
};

module.exports = { generateTraffic };
