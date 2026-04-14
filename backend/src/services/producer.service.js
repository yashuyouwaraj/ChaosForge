const producer = require("../config/kafka");

const sendMessage = async () => {
  await producer.connect();

  await producer.send({
    topic: "test-topic",
    messages: [{ value: "Hello ChaosForge 🚀" }],
  });

  console.log("Message sent to Kafka topic successfully! ✅");

  await producer.disconnect();
};

module.exports = { sendMessage };
