"use client";

import { useMemo } from "react";

import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";

import { useLiveLogs } from "@/hooks/useLiveLogs";

export function useRunAiInsights(projectId, runId) {
  const metrics = useRealtimeMetrics(projectId, runId);

  const logs = useLiveLogs(projectId, runId);

  const insights = useMemo(() => {
    const next = [];

    if (!metrics) {
      return next;
    }

    // HIGH LATENCY

    if (metrics.avgLatency > 1000) {
      next.push({
        type: "latency",

        severity: "warning",

        title: "Latency Spike Detected",

        description:
          "Average latency exceeded operational thresholds during the active simulation.",

        recommendation:
          "Inspect backend bottlenecks, Redis response times, and worker queue pressure.",
      });
    }

    // FAILURE RATE

    if (metrics.failure > 25) {
      next.push({
        severity: "critical",

        title: "Failure Rate Increasing",

        description:
          "Infrastructure failures are rising under sustained simulation load.",

        recommendation:
          "Investigate Kafka throughput, worker stability, and upstream API availability.",
      });
    }

    // REDIS WARNINGS

    const redisWarnings = logs.filter((log) =>
      log.message?.toLowerCase().includes("redis"),
    );

    if (redisWarnings.length > 3) {
      next.push({
        severity: "warning",

        title: "Redis Pressure Detected",

        description:
          "Repeated Redis-related operational warnings detected during telemetry processing.",

        recommendation:
          "Check Redis memory utilization, connection pooling, and persistence configuration.",
      });
    }

    // HIGH THROUGHPUT

    if (metrics.currentRps > 5000) {
      next.push({
        severity: "info",

        title: "High Throughput Sustained",

        description:
          "The system is successfully sustaining elevated realtime traffic throughput.",

        recommendation:
          "Continue monitoring websocket throughput and worker scaling under sustained load.",
      });
    }

    // P95 LATENCY

    if (metrics.p95Latency > 2000) {
      next.push({
        severity: "critical",

        title: "P95 Latency Degradation",

        description:
          "Tail latency is degrading under load, indicating infrastructure instability for slower requests.",

        recommendation:
          "Inspect backend saturation, distributed queue pressure, and request batching efficiency.",
      });
    }

    // LOW SUCCESS RATE

    const successRate =
      metrics.totalRequests > 0
        ? ((metrics.success / metrics.totalRequests) * 100).toFixed(1)
        : 100;

    if (successRate < 90) {
      next.push({
        severity: "critical",

        title: "Success Rate Dropping",

        description: `Operational success rate dropped to ${successRate}% during the active simulation.`,

        recommendation:
          "Investigate infrastructure instability, upstream failures, and traffic saturation.",
      });
    }

    // STABLE SYSTEM

    if (next.length === 0) {
      next.push({
        severity: "info",

        title: "Simulation Stable",

        description:
          "Realtime telemetry indicates stable infrastructure behavior for the active run.",

        recommendation:
          "Continue monitoring throughput, latency trends, and operational health.",
      });
    }

    return next;
  }, [metrics, logs]);

  return insights;
}
