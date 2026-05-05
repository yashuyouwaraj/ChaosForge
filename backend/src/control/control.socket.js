const { setRate, setStatus } = require("./control.store");

const registerControlHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("pause", async ({ projectId, runId }) => {
      try {
        await setStatus(projectId, runId, "paused");
      } catch (error) {
        socket.emit("control-error", { action: "pause", message: error.message });
      }
    });

    socket.on("resume", async ({ projectId, runId }) => {
      try {
        await setStatus(projectId, runId, "running");
      } catch (error) {
        socket.emit("control-error", { action: "resume", message: error.message });
      }
    });

    socket.on("stop", async ({ projectId, runId }) => {
      try {
        await setStatus(projectId, runId, "stopped");
      } catch (error) {
        socket.emit("control-error", { action: "stop", message: error.message });
      }
    });

    socket.on("set-rate", async ({ projectId, runId, rate }) => {
      try {
        await setRate(projectId, runId, rate);
      } catch (error) {
        socket.emit("control-error", { action: "set-rate", message: error.message });
      }
    });
  });
};

module.exports = { registerControlHandlers };
