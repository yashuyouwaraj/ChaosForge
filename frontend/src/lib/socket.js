import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:3001`;
  }

  return "http://localhost:3001";
};

const socket = io(getSocketUrl());

export default socket;
