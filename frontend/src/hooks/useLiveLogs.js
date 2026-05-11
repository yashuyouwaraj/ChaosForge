"use client";

import { useEffect, useState } from "react";

import { useSocket } from "@/components/providers/SocketProvider";
import socket from "@/lib/socket";

export function useLiveLogs(projectId, runId) {
  const socket = useSocket();

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const event = `logs-${projectId}-${runId}`;

    const handler = (incomingLogs) => {
      setLogs((prev) => {
        const merged = [...incomingLogs, ...prev];

        return merged.slice(0, 100);
      });
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, projectId, runId]);

  return logs;
}
