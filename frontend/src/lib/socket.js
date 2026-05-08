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

export default socket;
