"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRealtimeMetrics,
} from "@/hooks/useRealtimeMetrics";

import {
  useLiveLogs,
} from "@/hooks/useLiveLogs";

export function useAiInsights(
  projectId,
  runId,
) {
  const metrics =
    useRealtimeMetrics(
      projectId,
      runId,
    );

  const logs = useLiveLogs(
    projectId,
    runId,
  );

  const [insights, setInsights] =
    useState([]);

  const generatedInsights =
    useMemo(() => {
      const next = [];

      if (
        metrics?.avgLatency > 1000
      ) {
        next.push({
          severity: "warning",

          title:
            "Latency spike detected",

          description:
            "Average latency exceeded 1000ms threshold.",
        });
      }

      if (
        metrics?.failure > 25
      ) {
        next.push({
          severity: "critical",

          title:
            "Failure rate increasing",

          description:
            "Infrastructure failures rising under load.",
        });
      }

      const redisWarnings =
        logs.filter((log) =>
          log.message
            ?.toLowerCase()
            .includes("redis"),
        );

      if (
        redisWarnings.length > 3
      ) {
        next.push({
          severity: "warning",

          title:
            "Redis pressure anomaly",

          description:
            "Repeated Redis-related warnings detected.",
        });
      }

      if (
        metrics?.currentRps > 5000
      ) {
        next.push({
          severity: "info",

          title:
            "High throughput event",

          description:
            "Traffic surge successfully sustained.",
        });
      }

      return next;
    }, [metrics, logs]);

  useEffect(() => {
    setInsights(generatedInsights);
  }, [generatedInsights]);

  return insights;
}