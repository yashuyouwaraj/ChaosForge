const { Server } = require("socket.io");
const logger = require("../utils/logger");

let io;
const logBuffers = new Map();
const LOG_FLUSH_INTERVAL_MS = 100;
const MAX_LOG_BATCH = 100;

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

const flushLogBuffer = (projectId) => {
  const buffer = logBuffers.get(projectId);

  if (!buffer || buffer.length === 0 || !io) {
    return;
  }

  const logsToSend = buffer.splice(0, buffer.length);
  io.emit(`logs-${projectId}`, logsToSend);
};

const startLogFlushLoop = () => {
  setInterval(() => {
    if (!io) {
      return;
    }

    for (const [projectId, buffer] of logBuffers.entries()) {
      if (buffer.length > 0) {
        const logsToSend = buffer.splice(0, buffer.length);
        io.emit(`logs-${projectId}`, logsToSend);
      }
    }
  }, LOG_FLUSH_INTERVAL_MS);
};

const emitBufferedLog = (projectId, log) => {
  if (!logBuffers.has(projectId)) {
    logBuffers.set(projectId, []);
  }

  const buffer = logBuffers.get(projectId);
  buffer.push(log);

  if (buffer.length >= MAX_LOG_BATCH) {
    flushLogBuffer(projectId);
  }
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  startLogFlushLoop();
};

module.exports = { initSocket, getIO, emitBufferedLog };
