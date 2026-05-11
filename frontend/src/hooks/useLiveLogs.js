"use client";

import {
  useEffect,
  useState,
} from "react";

import socket
  from "@/lib/socket";

export function useLiveLogs(
  projectId,
  runId,
) {
  const [logs, setLogs] =
    useState([]);

  useEffect(() => {
    if (
      !projectId ||
      !runId
    ) {
      return;
    }

    const event =
      `logs-${projectId}-${runId}`;

    const handler = (
      incomingLogs,
    ) => {
      setLogs((prev) => {
        const merged = [
          ...incomingLogs,
          ...prev,
        ];

        return merged.slice(
          0,
          100,
        );
      });
    };

    socket.on(event, handler);

    return () => {
      socket.off(
        event,
        handler,
      );
    };
  }, [
    projectId,
    runId,
  ]);

  return logs;
}
