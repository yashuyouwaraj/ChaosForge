"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "@/lib/api";

export function useInfrastructureMemory(
  projectId,
) {
  const [runs, setRuns] =
    useState([]);
  const [loading, setLoading] =
    useState(Boolean(projectId));
  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!projectId) {
      setRuns([]);
      setLoading(false);
      setError("");
      return;
    }

    let ignore = false;

    const loadRuns =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await api(
              `/runs/${projectId}`,
            );

          if (!ignore) {
            setRuns(
              Array.isArray(data)
                ? data
                : [],
            );
          }
        } catch (err) {
          console.error(
            "Failed to load infrastructure memory:",
            err,
          );

          if (!ignore) {
            setError(
              err.message ||
                "Unable to load infrastructure memory.",
            );
            setRuns([]);
          }
        } finally {
          if (!ignore) {
            setLoading(false);
          }
        }
      };

    loadRuns();

    return () => {
      ignore = true;
    };
  }, [projectId]);

  const memory =
    useMemo(() => {
      if (
        !runs ||
        runs.length < 2
      ) {
        return [];
      }

      const insights = [];

      // HIGH LATENCY HISTORY

      const highLatencyRuns =
        runs.filter(
          (run) =>
            run.p95Latency >
            2000,
        );

      if (
        highLatencyRuns.length >=
        3
      ) {
        insights.push({
          type:
            "Recurring Tail Latency",

          severity:
            "high",

          description:
            `Tail latency instability detected across ${highLatencyRuns.length} historical executions.`,

          impact:
            "Distributed infrastructure may be repeatedly saturating under peak traffic conditions.",

          recommendation:
            "Evaluate worker scaling policies and request batching strategies.",
        });
      }

      // FAILURE PATTERNS

      const unstableRuns =
        runs.filter(
          (run) =>
            run.failure >
            25,
        );

      if (
        unstableRuns.length >=
        3
      ) {
        insights.push({
          type:
            "Recurring Failure Escalation",

          severity:
            "critical",

          description:
            `Operational failure bursts detected across ${unstableRuns.length} historical executions.`,

          impact:
            "Infrastructure instability patterns are recurring under distributed load.",

          recommendation:
            "Inspect upstream dependency resilience and retry amplification behavior.",
        });
      }

      // SATURATION

      const saturationRuns =
        runs.filter(
          (run) =>
            run.avgLatency >
              1000 &&
            run.rps >
              3000,
        );

      if (
        saturationRuns.length >=
        2
      ) {
        insights.push({
          type:
            "Infrastructure Saturation Pattern",

          severity:
            "high",

          description:
            `Repeated infrastructure saturation detected across ${saturationRuns.length} distributed executions.`,

          impact:
            "Concurrency pressure may be exceeding backend processing capacity.",

          recommendation:
            "Increase horizontal scaling and optimize queue processing throughput.",
        });
      }

      // STABLE RECOVERY

      const stableRuns =
        runs.filter(
          (run) =>
            run.failure <
              5 &&
            run.avgLatency <
              500,
        );

      if (
        stableRuns.length >=
        2
      ) {
        insights.push({
          type:
            "Successful Stabilization Pattern",

          severity:
            "info",

          description:
            `Previous remediation strategies improved operational stability across ${stableRuns.length} executions.`,

          impact:
            "Infrastructure recovery workflows appear effective under sustained traffic.",

          recommendation:
            "Continue applying current scaling and stabilization strategies.",
        });
      }

      return insights;
    }, [runs]);

  return {
    memory,
    loading,
    error,
  };
}
