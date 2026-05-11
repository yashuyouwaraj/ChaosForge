"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRealtimeMetrics,
} from "@/hooks/useRealtimeMetrics";

export function useMetricsHistory(
  projectId,
  runId,
) {
  const metrics =
    useRealtimeMetrics(
      projectId,
      runId,
    );

  const [history, setHistory] =
    useState([]);

  useEffect(() => {
    if (!metrics) return;

    setHistory((prev) => {
      const next = [
        ...prev,
        {
          timestamp:
            Date.now(),

          rps:
            metrics.currentRps || 0,

          latency:
            metrics.avgLatency || 0,

          failures:
            metrics.failure || 0,
        },
      ];

      return next.slice(-40);
    });
  }, [metrics]);

  return history;
}