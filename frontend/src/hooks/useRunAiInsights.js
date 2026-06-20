"use client";

import { useMemo } from "react";

import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";

import { useLiveLogs } from "@/hooks/useLiveLogs";

export function useRunAiInsights(projectId, runId) {
  const metrics = useRealtimeMetrics(projectId, runId);

  const logs = useLiveLogs(projectId, runId);

  const result = useMemo(() => {
    const next = [];

    if (!metrics) {
      return {
        insights: next,
        intelligence: null,
      };
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
        type: "failure",

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
        type: "redis",

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
        type: "throughput",

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
        type: "latency",

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
        type: "availability",

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
        type: "baseline",

        severity: "info",

        title: "Simulation Stable",

        description:
          "Realtime telemetry indicates stable infrastructure behavior for the active run.",

        recommendation:
          "Continue monitoring throughput, latency trends, and operational health.",
      });
    }

    const operationalSuccessRate =
      metrics.totalRequests > 0
        ? (metrics.success / metrics.totalRequests) * 100
        : 100;
    const failureRate =
      metrics.totalRequests > 0
        ? (metrics.failure / metrics.totalRequests) * 100
        : 0;
    const health = Math.max(
      0,
      Math.min(
        100,
          Math.round(
          operationalSuccessRate -
            Math.max(0, metrics.avgLatency - 500) / 40 -
            Math.max(0, metrics.p95Latency - 1000) / 60,
        ),
      ),
    );
    const risk =
      failureRate > 15 || metrics.p95Latency > 3000
        ? "Critical"
        : failureRate > 5 || metrics.p95Latency > 1500
          ? "High"
          : failureRate > 0 || metrics.avgLatency > 800
            ? "Moderate"
            : "Stable";
    const mostProbableIssue = next[0]?.title || "No dominant issue";
    const predictedFailure =
      risk === "Stable"
        ? "Low probability of near-term degradation"
        : next[0]?.description || "Operational degradation may continue";

    return {
      insights: next,
      intelligence: {
        currentHealth: `${health}/100`,
        riskLevel: risk,
        mostProbableIssue,
        predictedFailure,
        confidence: `${Math.min(95, 60 + next.length * 8)}%`,
        recommendation:
          next[0]?.recommendation ||
          "Continue monitoring throughput, latency trends, and operational health.",
      },
    };
  }, [metrics, logs]);

  return result;
}
