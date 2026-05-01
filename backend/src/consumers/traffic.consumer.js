const { Kafka } = require("kafkajs");
const { simulateProcessing } = require("../services/simulation.service");
const { getMetrics } = require("../metrics/metrics.store");
const { emitBufferedLog, getIO } = require("../websocket/socket");
const logger = require("../utils/logger");

const useKafka = process.env.USE_KAFKA === "true";

const kafka = new Kafka({
  clientId: "traffic-consumer",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "traffic-group" });

const runConsumer = async () => {
  if (!useKafka) {
    logger.info("Kafka disabled. Consumer not started.");
    return;
  }

  await consumer.connect();

  await consumer.subscribe({
    topic: "traffic-topic",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const data = JSON.parse(message.value.toString());

        if (data.type === "traffic-complete") {
          const io = getIO();

          emitBufferedLog(data.projectId, {
            requestId: data.requestId,
            message: `Completed ${data.total} requests`,
            type: "complete",
            time: new Date().toLocaleTimeString(),
          });
          io.emit(`metrics-${data.projectId}`, getMetrics(data.projectId));
          return;
        }

        const { requestId, projectId, url } = data;

        logger.info({
          requestId,
          message: `Processing request for ${url}`,
        });

        // 💀 REAL SIMULATION NOW
        await simulateProcessing(url, requestId, projectId);

      } catch (error) {
        logger.error({
          message: "Kafka message processing failed",
          error: error.message,
        });
      }
    },
  });
};

module.exports = runConsumer;
