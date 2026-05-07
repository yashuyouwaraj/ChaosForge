const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    //Join Run Room
    socket.on("join-run", ({ runId }) => {
      socket.join(`run-${runId}`);
    });

    //leave Room
    socket.on("leave-run", ({ runId }) => {
      socket.leave(`run-${runId}`);
    });
  });

  return io;
};

const getIo = () => io;

module.exports = {
  initSocket,
  getIo,
};
