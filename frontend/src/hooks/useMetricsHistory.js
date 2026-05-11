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
  isActive = true,
) {
  const metrics =
    useRealtimeMetrics(
      projectId,
      runId,
    );

  const [history, setHistory] =
    useState([]);

  useEffect(() => {
    setHistory([]);
  }, [
    projectId,
    runId,
  ]);

  useEffect(() => {
    if (!metrics || !isActive) {
      return;
    }

    setHistory((prev) => {
      const timestamp =
        Date.now();
      const startTimestamp =
        prev[0]?.timestamp ||
        timestamp;
      const elapsedSec =
        Math.max(
          0,
          Math.round(
            (timestamp -
              startTimestamp) /
              1000,
          ),
        );
      const nextPoint = {
        timestamp,
        elapsedSec,
        rps:
          metrics.currentRps || 0,
        avgLatency:
          metrics.avgLatency || 0,
        p95Latency:
          metrics.p95Latency || 0,
        failures:
          metrics.failure || 0,
        errorTypes:
          metrics.errorTypes || {
            timeout: 0,
            network: 0,
            server: 0,
          },
      };

      if (
        prev.length > 0 &&
        prev[
          prev.length - 1
        ].elapsedSec ===
          elapsedSec
      ) {
        return [
          ...prev.slice(0, -1),
          nextPoint,
        ];
      }

      const next = [
        ...prev,
        nextPoint,
      ];

      return next.slice(-240);
    });
  }, [
    isActive,
    metrics,
  ]);

  return history;
}
