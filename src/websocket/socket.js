const { Server } = require("socket.io");
const logger = require("../utils/logger");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect",()=>{
        console.log(`Client disconnected: ${socket.id}`);
    })
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };
