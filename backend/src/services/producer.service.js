const {
  producer,
  connectProducer,
  TEST_TOPIC,
} = require("../config/kafka");

const sendMessage = async () => {
  if (process.env.USE_KAFKA !== "true") {
    console.log("Skipping Kafka send because USE_KAFKA is not true.");
    return;
  }

  await connectProducer();

  await producer.send({
    topic: TEST_TOPIC,
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
