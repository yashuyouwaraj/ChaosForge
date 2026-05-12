import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:3001`;
  }

  return "http://localhost:3001";
};

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

const socket = io(getSocketUrl(), {
  transports: ["websocket", "polling"],
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
