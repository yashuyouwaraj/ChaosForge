const { setRate, setStatus } = require("./control.store");

const registerControlHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("pause", async ({ projectId, runId }, ack) => {
      try {
        await setStatus(projectId, runId, "paused");
        ack?.({ ok: true, status: "paused" });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
        socket.emit("control-error", { action: "pause", message: error.message });
      }
    });

    socket.on("resume", async ({ projectId, runId }, ack) => {
      try {
        await setStatus(projectId, runId, "running");
        ack?.({ ok: true, status: "running" });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
        socket.emit("control-error", { action: "resume", message: error.message });
      }
    });

    socket.on("stop", async ({ projectId, runId }, ack) => {
      try {
        await setStatus(projectId, runId, "stopped");
        ack?.({ ok: true, status: "stopped" });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
        socket.emit("control-error", { action: "stop", message: error.message });
      }
    });

    socket.on("set-rate", async ({ projectId, runId, rate }, ack) => {
      try {
        const parsedRate = Number(rate);

        if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
          throw new Error("Rate must be greater than 0");
        }

        await setRate(projectId, runId, parsedRate);
        ack?.({ ok: true, rate: parsedRate });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
        socket.emit("control-error", { action: "set-rate", message: error.message });
      }
    });
  });
};

module.exports = { registerControlHandlers };
