const { setRate, setStatus } = require("./control.store");
const Run = require("../modules/run/run.model");
const User = require("../modules/user/user.model");
const jwt = require("jsonwebtoken");
const { addIncident } = require("../services/incidentTimeline");

const getSocketUserId = async (socket) => {
  const authToken = socket.handshake.auth?.token;
  const authHeader = socket.handshake.headers?.authorization;

  const token = authToken || authHeader?.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // JWT contains user id
    if (decoded.id) {
      return decoded.id;
    }

    // fallback using email
    if (decoded.email) {
      const user = await User.findOne({
        email: decoded.email,
      }).select("_id");

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

  const run = await Run.findOne({
    projectId,
    runId,
  }).select("owner");

  return !!run && run.owner.toString() === userId;
};

const registerControlHandlers = (io) => {
  io.on("connection", (socket) => {

    /**
     * 💀 JOIN RUN ROOM
     */
    socket.on("join-run", async ({ projectId, runId }, ack) => {
      try {
        const allowed = await ownsRun(socket, projectId, runId);

        if (!allowed) {
          return ack?.({
            ok: false,
            message: "Unauthorized",
          });
        }

        socket.join(`run-${runId}`);

        ack?.({
          ok: true,
          room: `run-${runId}`,
        });

      } catch (error) {
        ack?.({
          ok: false,
          message: error.message,
        });
      }
    });

    /**
     * 💀 LEAVE RUN ROOM
     */
    socket.on("leave-run", ({ runId }, ack) => {
      socket.leave(`run-${runId}`);

      ack?.({
        ok: true,
      });
    });

    /**
     * 💀 PAUSE
     */
    socket.on("pause", async ({ projectId, runId }, ack) => {
      try {
        const allowed = await ownsRun(socket, projectId, runId);

        if (!allowed) {
          return ack?.({
            ok: false,
            message: "Unauthorized",
          });
        }

        await setStatus(projectId, runId, "paused");
        await Run.updateOne(
          { projectId, runId },
          { $set: { status: "paused" } },
        );

        addIncident({
          type: "simulation",
          severity: "warning",
          title: "Simulation Paused",
          message: `Run ${runId} paused.`,
          metadata: {
            projectId,
            runId,
          },
        });

        io.to(`run-${runId}`).emit("run-status", {
          runId,
          status: "paused",
        });

        ack?.({
          ok: true,
          status: "paused",
        });

      } catch (error) {
        ack?.({
          ok: false,
          message: error.message,
        });

        socket.emit("control-error", {
          action: "pause",
          message: error.message,
        });
      }
    });

    /**
     * 💀 RESUME
     */
    socket.on("resume", async ({ projectId, runId }, ack) => {
      try {
        const allowed = await ownsRun(socket, projectId, runId);

        if (!allowed) {
          return ack?.({
            ok: false,
            message: "Unauthorized",
          });
        }

        await setStatus(projectId, runId, "running");
        await Run.updateOne(
          { projectId, runId },
          { $set: { status: "running" } },
        );

        addIncident({
          type: "simulation",
          severity: "info",
          title: "Simulation Resumed",
          message: `Run ${runId} resumed.`,
          metadata: {
            projectId,
            runId,
          },
        });

        io.to(`run-${runId}`).emit("run-status", {
          runId,
          status: "running",
        });

        ack?.({
          ok: true,
          status: "running",
        });

      } catch (error) {
        ack?.({
          ok: false,
          message: error.message,
        });

        socket.emit("control-error", {
          action: "resume",
          message: error.message,
        });
      }
    });

    /**
     * 💀 STOP
     */
    socket.on("stop", async ({ projectId, runId }, ack) => {
      try {
        const allowed = await ownsRun(socket, projectId, runId);

        if (!allowed) {
          return ack?.({
            ok: false,
            message: "Unauthorized",
          });
        }

        await setStatus(projectId, runId, "stopped");
        await Run.updateOne(
          { projectId, runId },
          { $set: { status: "stopped" } },
        );

        addIncident({
          type: "simulation",
          severity: "warning",
          title: "Simulation Stopped",
          message: `Run ${runId} stopped.`,
          metadata: {
            projectId,
            runId,
          },
        });

        io.to(`run-${runId}`).emit("run-status", {
          runId,
          status: "stopped",
        });

        ack?.({
          ok: true,
          status: "stopped",
        });

      } catch (error) {
        ack?.({
          ok: false,
          message: error.message,
        });

        socket.emit("control-error", {
          action: "stop",
          message: error.message,
        });
      }
    });

    /**
     * 💀 LIVE RATE CHANGE
     */
    socket.on("set-rate", async ({ projectId, runId, rate }, ack) => {
      try {
        const allowed = await ownsRun(socket, projectId, runId);

        if (!allowed) {
          return ack?.({
            ok: false,
            message: "Unauthorized",
          });
        }

        const parsedRate = Number(rate);

        if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
          throw new Error("Rate must be greater than 0");
        }

        await setRate(projectId, runId, parsedRate);

        addIncident({
          type: "simulation",
          severity: "info",
          title: "Simulation RPS Updated",
          message: `Run ${runId} rate changed to ${parsedRate} RPS.`,
          metadata: {
            projectId,
            runId,
            rate: parsedRate,
          },
        });

        io.to(`run-${runId}`).emit("rate-updated", {
          runId,
          rate: parsedRate,
        });

        ack?.({
          ok: true,
          rate: parsedRate,
        });

      } catch (error) {
        ack?.({
          ok: false,
          message: error.message,
        });

        socket.emit("control-error", {
          action: "set-rate",
          message: error.message,
        });
      }
    });

    /**
     * 💀 DISCONNECT
     */
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });

  });
};

module.exports = { registerControlHandlers };
