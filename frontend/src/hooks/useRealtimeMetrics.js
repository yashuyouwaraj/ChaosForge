"use client";

import {
  useEffect,
  useState,
} from "react";

import socket
  from "@/lib/socket";

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

    const event =
      `metrics-${projectId}-${runId}`;

    const handler = (data) => {
      setMetrics(data);
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

  return metrics;
}
