require("dotenv").config();

const http = require("http");
const { initSocket } = require("./websocket/socket");
const app = require("./app");
const runConsumer = require("./consumers/traffic.consumer");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { connectProducer } = require("./config/kafka");
const cors = require("cors");
const errorHandler = require("./middleware/error.middleware");

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

const useKafka = process.env.USE_KAFKA === "true";

// init socket
initSocket(server);

app.use(errorHandler);

app.use(
  cors({
    origin: "*",
  }),
);

connectDB();

const startServer = async () => {
  try {
    await connectRedis();

    if (useKafka) {
      await connectProducer();
      runConsumer();
      console.log("Kafka consumer started.");
    } else {
      console.log("Kafka disabled in production. Skipping consumer startup.");
    }

    server.listen(PORT, () => {
      console.log(`Server is running on port localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed", err);
    process.exit(1);
  }
};

startServer();
