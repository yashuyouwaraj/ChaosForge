"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useSocket,
} from "@/components/providers/SocketProvider";

export function useRealtimeMetrics(
  projectId,
  runId,
) {
  const socket = useSocket();

  const [metrics, setMetrics] =
    useState(null);

  useEffect(() => {
    if (!socket) return;

    const event =
      `metrics-${projectId}-${runId}`;

    const handler = (data) => {
      setMetrics(data);
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [
    socket,
    projectId,
    runId,
  ]);

  return metrics;
}