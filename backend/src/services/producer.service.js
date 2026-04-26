const producer = require("../config/kafka");

const sendMessage = async () => {
  if (process.env.USE_KAFKA !== "true") {
    console.log("Skipping Kafka send because USE_KAFKA is not true.");
    return;
  }

  await producer.connect();

  await producer.send({
    topic: "test-topic",
    messages: [
      {
        value: JSON.stringify({
          requestId: `manual-${Date.now()}`,
          request: "Hello ChaosForge",
        }),
      },
    ],
  });

  console.log("Message sent to Kafka topic successfully!");

  await producer.disconnect();
};

module.exports = { sendMessage };
