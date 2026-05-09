require("dotenv").config();

const http = require("http");

const app = require("./app");

const { initSocket } = require("./websocket/socket");

const connectDB = require("./config/db");

const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

initSocket(server);

connectDB();

const startServer = async () => {
  try {
    await connectRedis();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Startup failed", err);

    process.exit(1);
  }
};

startServer();

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});