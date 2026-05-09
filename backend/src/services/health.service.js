const { timeStamp } = require("console");
const os = require("os");
const { uptime } = require("process");
const { getConnectedClients } = require("../websocket/socket");

const { client: redis } = require("../config/redis");

const getSystemHealth = async () => {
  let redisStatus = "disconnected";

  try {
    await redis.ping();

    redisStatus = "connected";
  } catch (err) {
    redisStatus = "error";
  }

  return {
    status: "ok",
    uptime: process.uptime(),
    memory: {
      res: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal,
    },
    cpuLoad: os.loadavg(),
    platform: os.platform(),
    nodeVersion: process.version,
    redis: redisStatus,
    websockets: {
      connectedClients: getConnectedClients(),
    },
    timeStamp: new Date().toISOString(),
  };
};

module.exports = {
  getSystemHealth,
};
