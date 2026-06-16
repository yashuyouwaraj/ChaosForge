"use client";

import {
  useEffect,
  useState,
} from "react";

import socket
  from "@/lib/socket";
import {
  joinRun,
} from "@/lib/socket";

export function useRealtimeMetrics(
  projectId,
  runId,
) {
  const [metrics, setMetrics] =
    useState(null);

  useEffect(() => {
    if (
      !projectId ||
      !runId
    ) {
      return;
    }

    let cancelled = false;
    const event =
      `metrics-${projectId}-${runId}`;

    const handler = (data) => {
      if (!cancelled) {
        setMetrics(data);
      }
    };
    
    const joinSelectedRun = () => {
      joinRun(projectId, runId);
    };

    // Join immediately with retry logic
    queueMicrotask(() => {
      if (!cancelled) {
        joinSelectedRun();
        // Rejoin on reconnect
        socket.on(
          "connect",
          joinSelectedRun,
        );
      }
    });

    // Listen for events
    socket.on(event, handler);

    return () => {
      cancelled = true;
      socket.off(
        event,
        handler,
      );
      socket.off(
        "connect",
        joinSelectedRun,
      );
    };
  }, [
    projectId,
    runId,
  ]);

  return metrics;
}
