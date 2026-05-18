const { Server } = require("socket.io");
const logger = require("../utils/logger");
const { registerControlHandlers } = require("../control/control.socket");
const { connectRedis } = require("../config/redis");
const { activeWebSocketClients } = require("../metrics/prometheus");
const { getRunLogsEvent } = require("./events");

const LOG_QUEUE_KEY = "socket:logs:queue";
const LOG_FLUSH_INTERVAL_MS = 100;
const MAX_LOG_BATCH = 100;
const MAX_REDIS_LOG_BATCH = 500;

let io;
let connectedClients = 0;
let flushLoopStarted = false;
const connectedSocketIds = new Set();

const logBuffers = new Map();

const LOG_LEVEL_BY_TYPE = {
  error: "error",
  retry: "warn",
  success: "info",
  info: "info",
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};

const getIOIfReady = () => io || null;

const getBufferKey = (projectId, runId) => `${projectId}:${runId}`;

const queueLogInRedis = async (projectId, runId, log) => {
  try {
    const redis = await connectRedis();

    await redis.rPush(
      LOG_QUEUE_KEY,
      JSON.stringify({
        projectId,
        runId,
        log,
      }),
    );
  } catch (err) {
    logger.warn({
      message: "socket_log_queue_failed",
      error: err.message,
      projectId,
      runId,
    });
  }
};

const flushLogBuffer = (projectId, runId) => {
  const key = getBufferKey(projectId, runId);
  const buffer = logBuffers.get(key);

  if (!buffer || buffer.length === 0 || !io) {
    return;
  }

  const logsToSend = buffer.splice(0, buffer.length);

  io.to(`run-${runId}`).emit(getRunLogsEvent(projectId, runId), logsToSend);

  if (buffer.length === 0) {
    logBuffers.delete(key);
  }
};

const bufferLog = (projectId, runId, log) => {
  const key = getBufferKey(projectId, runId);

  if (!logBuffers.has(key)) {
    logBuffers.set(key, []);
  }

  const buffer = logBuffers.get(key);
  buffer.push(log);

  if (buffer.length >= MAX_LOG_BATCH) {
    flushLogBuffer(projectId, runId);
  }
};

const drainRedisLogQueue = async () => {
  const redis = await connectRedis();

  for (let i = 0; i < MAX_REDIS_LOG_BATCH; i++) {
    const item = await redis.lPop(LOG_QUEUE_KEY);

    if (!item) {
      return;
    }

    try {
      const { projectId, runId, log } = JSON.parse(item);

      if (projectId && runId && log) {
        bufferLog(projectId, runId, log);
      }
    } catch (err) {
      logger.warn({
        message: "socket_log_queue_parse_failed",
        error: err.message,
      });
    }
  }
};

const startLogFlushLoop = () => {
  if (flushLoopStarted) {
    return;
  }

  flushLoopStarted = true;

  const flushLoop = async () => {
    if (!io) {
      return;
    }

    await drainRedisLogQueue();

    for (const [key, buffer] of logBuffers.entries()) {
      if (!buffer || buffer.length === 0) {
        logBuffers.delete(key);
        continue;
      }

      const [projectId, runId] = key.split(":");
      const logsToSend = buffer.splice(0, buffer.length);

      io.to(`run-${runId}`).emit(getRunLogsEvent(projectId, runId), logsToSend);

      if (buffer.length === 0) {
        logBuffers.delete(key);
      }
    }
  };

  setInterval(() => {
    flushLoop().catch((err) => {
      console.error("Socket log flush failed:", err.message);
    });
  }, LOG_FLUSH_INTERVAL_MS);
};

const emitBufferedLog = (projectId, runId, log) => {
  const normalizedLog = {
    ...log,
    level: log.level || LOG_LEVEL_BY_TYPE[log.type] || "info",
    timestamp: log.timestamp || Date.now(),
  };

  if (!io) {
    queueLogInRedis(projectId, runId, normalizedLog).catch(() => {});
    return;
  }

  bufferLog(projectId, runId, normalizedLog);
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.on("connection", (socket) => {
    connectedSocketIds.add(socket.id);
    connectedClients = connectedSocketIds.size;
    activeWebSocketClients.set(connectedClients);

    logger.info({
      message: "socket_connected",
      socketId: socket.id,
      connectedClients,
    });

    socket.on("join-run", ({ runId }) => {
      socket.join(`run-${runId}`);

      logger.info({
        message: "socket_joined_run",
        socketId: socket.id,
        runId,
      });
    });

    socket.on("leave-run", ({ runId }) => {
      socket.leave(`run-${runId}`);

      logger.info({
        message: "socket_left_run",
        socketId: socket.id,
        runId,
      });
    });

    socket.on("disconnect", () => {
      connectedSocketIds.delete(socket.id);
      connectedClients = connectedSocketIds.size;
      activeWebSocketClients.set(connectedClients);

      logger.info({
        message: "socket_disconnected",
        socketId: socket.id,
        connectedClients,
      });
    });
  });

  registerControlHandlers(io);
  startLogFlushLoop();

  return io;
};

const getConnectedClients = () => {
  if (!io) {
    return 0;
  }

  return io.of("/").sockets.size;
};

module.exports = {
  initSocket,
  getIO,
  getIOIfReady,
  emitBufferedLog,
  getConnectedClients,
};
