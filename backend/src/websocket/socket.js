const { Server } = require("socket.io");
const logger = require("../utils/logger");
const { registerControlHandlers } = require("../control/control.socket");

let io;

/**
 * 💀 KEY:
 * projectId:runId
 */
const logBuffers = new Map();

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

  setInterval(() => {
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
        logsToSend
      );

      // 💀 CLEANUP
      if (buffer.length === 0) {
        logBuffers.delete(key);
      }
    }
  }, LOG_FLUSH_INTERVAL_MS);
};

/**
 * 💀 ISOLATED BUFFERED LOG EMIT
 */
const emitBufferedLog = (projectId, runId, log) => {
  if (!io) {
    return;
  }

  const key = getBufferKey(projectId, runId);

  if (!logBuffers.has(key)) {
    logBuffers.set(key, []);
  }

  const normalizedLog = {
    ...log,
    level: log.level || LOG_LEVEL_BY_TYPE[log.type] || "info",
    timestamp: log.timestamp || Date.now(),
  };

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
    logger.info({
      message: "socket_connected",
      socketId: socket.id,
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
      logger.info({
        message: "socket_disconnected",
        socketId: socket.id,
      });
    });
  });

  registerControlHandlers(io);

  startLogFlushLoop();

  return io;
};

module.exports = {
  initSocket,
  getIO,
  emitBufferedLog,
};