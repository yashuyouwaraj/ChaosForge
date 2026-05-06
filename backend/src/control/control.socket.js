const { setRate, setStatus } = require("./control.store");
const Run = require("../modules/run/run.model");
const User = require("../modules/user/user.model");
const jwt = require("jsonwebtoken");

const getSocketUserId = async (socket) => {
  const authToken = socket.handshake.auth?.token;
  const authHeader = socket.handshake.headers?.authorization;
  const token = authToken || authHeader?.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id) {
      return decoded.id;
    }

    if (decoded.email) {
      const user = await User.findOne({ email: decoded.email }).select("_id");
      return user?._id.toString() || null;
    }

    return null;
  } catch {
    return null;
  }
};

const ownsRun = async (socket, projectId, runId) => {
  const userId = await getSocketUserId(socket);

  if (!userId) {
    return false;
  }

  const run = await Run.findOne({ projectId, runId }).select("owner");
  return !!run && run.owner.toString() === userId;
};

const registerControlHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("pause", async ({ projectId, runId }, ack) => {
      try {
        if (!(await ownsRun(socket, projectId, runId))) {
          return;
        }

        await setStatus(projectId, runId, "paused");
        ack?.({ ok: true, status: "paused" });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
        socket.emit("control-error", {
          action: "pause",
          message: error.message,
        });
      }
    });

    socket.on("resume", async ({ projectId, runId }, ack) => {
      try {
        if (!(await ownsRun(socket, projectId, runId))) {
          return;
        }

        await setStatus(projectId, runId, "running");
        ack?.({ ok: true, status: "running" });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
        socket.emit("control-error", {
          action: "resume",
          message: error.message,
        });
      }
    });

    socket.on("stop", async ({ projectId, runId }, ack) => {
      try {
        if (!(await ownsRun(socket, projectId, runId))) {
          return;
        }

        await setStatus(projectId, runId, "stopped");
        ack?.({ ok: true, status: "stopped" });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
        socket.emit("control-error", {
          action: "stop",
          message: error.message,
        });
      }
    });

    socket.on("set-rate", async ({ projectId, runId, rate }, ack) => {
      try {
        if (!(await ownsRun(socket, projectId, runId))) {
          return;
        }

        const parsedRate = Number(rate);

        if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
          throw new Error("Rate must be greater than 0");
        }

        await setRate(projectId, runId, parsedRate);
        ack?.({ ok: true, rate: parsedRate });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
        socket.emit("control-error", {
          action: "set-rate",
          message: error.message,
        });
      }
    });
  });
};

module.exports = { registerControlHandlers };
