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
      setMetrics(data);
    };
    const joinSelectedRun = () => {
      joinRun(projectId, runId);
    };

    queueMicrotask(() => {
      if (!cancelled) {
        setMetrics(null);
      }
    });

    joinSelectedRun();
    socket.on(event, handler);
    socket.on(
      "connect",
      joinSelectedRun,
    );

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
