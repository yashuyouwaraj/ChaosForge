"use client";

import { useEffect, useState } from "react";

import { useSocket } from "@/components/providers/SocketProvider";

export function useActiveSimulations() {
  const socket = useSocket();

  const [runs, setRuns] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handler = (simulations) => {
      setRuns(simulations);
    };

    socket.on("active-simulations", handler);

    return () => {
      socket.off("active-simulations", handler);
    };
  }, [socket]);

  return runs;
}
