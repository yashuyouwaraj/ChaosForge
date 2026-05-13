import { io } from "socket.io-client";
import { getSocketBaseUrl } from "./runtime";

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

const socket = io(getSocketBaseUrl(), {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  auth: {
    token: getToken(),
  },
});

let currentAuthToken = getToken();

const refreshSocketAuth = () => {
  const token = getToken();

  socket.auth = {
    token,
  };

  if (socket.connected && token !== currentAuthToken) {
    socket.disconnect().connect();
  }

  currentAuthToken = token;
};

export const joinRun = (projectId, runId, ack) => {
  refreshSocketAuth();
  socket.emit("join-run", { projectId, runId }, ack);
};

export const leaveRun = (runId, ack) => {
  socket.emit("leave-run", { runId }, ack);
};

const emitWithAck = (event, payload) =>
  new Promise((resolve, reject) => {
    refreshSocketAuth();
    socket.emit(event, payload, (response) => {
      if (!response?.ok) {
        reject(
          new Error(
            response?.message || `Failed to ${event}.`,
          ),
        );
        return;
      }

      resolve(response);
    });
  });

export const pauseRun = (projectId, runId) =>
  emitWithAck("pause", {
    projectId,
    runId,
  });

export const resumeRun = (projectId, runId) =>
  emitWithAck("resume", {
    projectId,
    runId,
  });

export const stopRun = (projectId, runId) =>
  emitWithAck("stop", {
    projectId,
    runId,
  });

export const updateRunRate = (
  projectId,
  runId,
  rate,
) =>
  emitWithAck("set-rate", {
    projectId,
    runId,
    rate,
  });

export default socket;
