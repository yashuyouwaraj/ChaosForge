"use client";

import {
  useMemo,
} from "react";

import {
  useRegressionAnalysis,
} from "@/hooks/useRegressionAnalysis";

import {
  useRealtimeMetrics,
} from "@/hooks/useRealtimeMetrics";
import { rate, toNumber } from "@/lib/metrics";

const scoreFromThreshold = (value, threshold) =>
  Math.min(100, Math.round((toNumber(value) / threshold) * 100));

const severityFromScore = (score) => {
  if (score >= 90) {
    return "critical";
  }

  if (score >= 70) {
    return "high";
  }

  return "moderate";
};

export function useAnomalyDetection(
  projectId,
  runId,
  runSnapshot = null,
) {
  const regression =
    useRegressionAnalysis(
      projectId,
      runId,
    );

  const metrics =
    useRealtimeMetrics(
      projectId,
      runId,
    );

  const anomalies =
    useMemo(() => {
      if (
        !regression
      ) {
        return [];
      }

      const telemetry = {
        ...(runSnapshot || {}),
        ...(metrics || {}),
      };

      if (!telemetry.totalRequests && !telemetry.p95Latency && !telemetry.avgLatency) {
        return [];
      }

      const next = [];

      const {
        deltas,
      } = regression;

      const p95Latency = toNumber(telemetry.p95Latency);
      const avgLatency = toNumber(telemetry.avgLatency);
      const effectiveRps = toNumber(telemetry.currentRps || telemetry.rps);
      const failureRate = rate(telemetry.failure, telemetry.totalRequests);
      const p95Delta = deltas?.p95Latency;
      const avgLatencyDelta = deltas?.avgLatency;
      const failureDelta = deltas?.failure;
      const rpsDelta = deltas?.rps;

      // LATENCY SPIKE

      if (
        p95Latency >
          2000 ||
        p95Delta >
          40
      ) {
        const score = Math.max(
          scoreFromThreshold(
            p95Latency,
            3000,
          ),
          p95Delta == null
            ? 0
            : Math.min(
                100,
                Math.abs(p95Delta),
              ),
        );

        next.push({
          type:
            "Latency Anomaly",

          severity:
            severityFromScore(score),

          score:
            score,

          description:
            "Tail latency deviation exceeded expected operational thresholds during distributed execution.",

          recommendation:
            "Inspect worker saturation, Redis pressure, and upstream response degradation.",
        });
      }

      // FAILURE BURST

      if (
        failureRate >=
          5 ||
        failureDelta >
          5
      ) {
        const score = Math.max(
          scoreFromThreshold(
            failureRate,
            15,
          ),
          failureDelta == null
            ? 0
            : scoreFromThreshold(
                failureDelta,
                10,
              ),
        );

        next.push({
          type:
            "Failure Burst",

          severity:
            severityFromScore(score),

          score:
            score,

          description:
            "Failure-rate acceleration detected during sustained infrastructure load.",

          recommendation:
            "Investigate infrastructure instability and retry amplification behavior.",
        });
      }

      // THROUGHPUT COLLAPSE

      if (
        rpsDelta < -25
      ) {
        next.push({
          type:
            "Throughput Collapse",

          severity:
            "critical",

          score:
            Math.min(
              100,
              Math.abs(rpsDelta),
            ),

          description:
            "Distributed throughput degraded significantly compared to previous execution.",

          recommendation:
            "Inspect scaling bottlenecks and queue processing capacity.",
        });
      }

      // INFRASTRUCTURE SATURATION

      if (
        avgLatency >
          1000 &&
        effectiveRps >=
          100
      ) {
        next.push({
          type:
            "Infrastructure Saturation",

          severity:
            avgLatency > 1800
              ? "critical"
              : "high",

          score:
            Math.max(
              78,
              scoreFromThreshold(
                avgLatency,
                1800,
              ),
            ),

          description:
            "High concurrency combined with elevated latency indicates infrastructure saturation risk.",

          recommendation:
            "Increase worker scaling and evaluate backend concurrency handling.",
        });
      }

      // TELEMETRY INSTABILITY

      if (
        avgLatency >
          0 &&
        p95Latency >
          avgLatency *
            3 &&
        p95Latency >
          1000
      ) {
        next.push({
          type:
            "Telemetry Instability",

          severity:
            "moderate",

          score: 60,

          description:
            "Large deviation between average and tail latency detected.",

          recommendation:
            "Inspect request distribution imbalance and tail latency amplification.",
        });
      }

      // LATENCY REGRESSION

      if (
        avgLatencyDelta >
          20 &&
        p95Delta >
          20
      ) {
        next.push({
          type:
            "Latency Regression",

          severity:
            "high",

          score:
            Math.min(
              100,
              Math.round(
                (avgLatencyDelta +
                  p95Delta) /
                  2,
              ),
            ),

          description:
            "Average and tail latency both regressed compared to the previous execution.",

          recommendation:
            "Compare deployment, configuration, and upstream dependency changes between runs.",
        });
      }

      return next;
    }, [
      regression,
      metrics,
      runSnapshot,
    ]);

  return anomalies;
}
