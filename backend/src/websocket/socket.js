const { Server } = require("socket.io");
const logger = require("../utils/logger");
const { registerControlHandlers } = require("../control/control.socket");
const { connectRedis } = require("../config/redis");

const LOG_QUEUE_KEY = "socket:logs:queue";

let io;

/**
 * 💀 KEY:
 * projectId:runId
 */
const logBuffers = new Map();

let connectedClients = 0;

const LOG_FLUSH_INTERVAL_MS = 100;
const MAX_LOG_BATCH = 100;

let flushLoopStarted = false;

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

const queueLogInRedis = async () => {
  // No-op: disable worker-side log queueing to avoid excessive Redis requests.
};

/**
 * 💀 UNIQUE BUFFER KEY
 */
const getBufferKey = (projectId, runId) => {
  return `${projectId}:${runId}`;
};

/**
 * 💀 FLUSH SINGLE RUN BUFFER
 */
const flushLogBuffer = (projectId, runId) => {
  const key = getBufferKey(projectId, runId);

  const buffer = logBuffers.get(key);

  if (!buffer || buffer.length === 0 || !io) {
    return;
  }

  const logsToSend = buffer.splice(0, buffer.length);

  io.to(`run-${runId}`).emit(
    `logs-${projectId}-${runId}`,
    logsToSend
  );

  // 💀 CLEAN EMPTY BUFFER
  if (buffer.length === 0) {
    logBuffers.delete(key);
  }
};

/**
 * 💀 GLOBAL FLUSH LOOP
 */
const startLogFlushLoop = () => {
  if (flushLoopStarted) {
    return;
  }

  flushLoopStarted = true;

  const flushLoop = async () => {
    if (!io) {
      return;
    }

    for (const [key, buffer] of logBuffers.entries()) {
      if (!buffer || buffer.length === 0) {
        logBuffers.delete(key);
        continue;
      }

      const [projectId, runId] = key.split(":");

      const logsToSend = buffer.splice(0, buffer.length);

      io.to(`run-${runId}`).emit(
        `logs-${projectId}-${runId}`,
        logsToSend,
      );

      // 💀 CLEANUP
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

/**
 * 💀 ISOLATED BUFFERED LOG EMIT
 */
const emitBufferedLog = (projectId, runId, log) => {
  const normalizedLog = {
    ...log,
    level: log.level || LOG_LEVEL_BY_TYPE[log.type] || "info",
    timestamp: log.timestamp || Date.now(),
  };

  if (!io) {
    // Do not queue logs when no socket server is available.
    return;
  }

  const key = getBufferKey(projectId, runId);

  if (!logBuffers.has(key)) {
    logBuffers.set(key, []);
  }

  const buffer = logBuffers.get(key);

  buffer.push(normalizedLog);

  // 💀 FORCE FLUSH IF BUFFER LARGE
  if (buffer.length >= MAX_LOG_BATCH) {
    flushLogBuffer(projectId, runId);
  }
};

/**
 * 💀 SOCKET INIT
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    connectedClients++;
    logger.info({
      message: "socket_connected",
      socketId: socket.id,
      connectedClients,
    });

    /**
     * 💀 JOIN RUN ROOM
     */
    socket.on("join-run", ({ runId }) => {
      socket.join(`run-${runId}`);

      logger.info({
        message: "socket_joined_run",
        socketId: socket.id,
        runId,
      });
    });

    /**
     * 💀 LEAVE RUN ROOM
     */
    socket.on("leave-run", ({ runId }) => {
      socket.leave(`run-${runId}`);

      logger.info({
        message: "socket_left_run",
        socketId: socket.id,
        runId,
      });
    });

    socket.on("disconnect", () => {
      connectedClients--;
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

const getConnectedClients = () => connectedClients;

module.exports = {
  initSocket,
  getIO,
  getIOIfReady,
  emitBufferedLog,
  getConnectedClients,
};