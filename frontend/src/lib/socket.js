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

const socket = io(getSocketUrl());

export default socket;
