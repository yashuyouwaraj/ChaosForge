const producer = require("../config/kafka");

const generateTraffic = async (count = 10) => {
  await producer.connect();

  const messages = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      value: `Request-${i + 1}`,
    });
  }

  await producer.send({
    topic: "test-topic",
    messages
  });

  console.log(`${count} messages send to kafka...`)

  await producer.disconnect();
};

module.exports = {generateTraffic};
