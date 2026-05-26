"use client";

import { useMemo } from "react";

import { useAnomalyDetection } from "@/hooks/useAnomalyDetection";

import { usePredictiveRisk } from "@/hooks/usePredictiveRisk";

import { useRegressionAnalysis } from "@/hooks/useRegressionAnalysis";

export function useRemediationRecommendations(projectId, runId) {
  const anomalies = useAnomalyDetection(projectId, runId);

  const prediction = usePredictiveRisk(projectId, runId);

  const regression = useRegressionAnalysis(projectId, runId);

  const recommendations = useMemo(() => {
    if (!prediction || !regression) {
      return [];
    }

    const next = [];

    const { deltas, currentRun } = regression;

    // LATENCY

    if (deltas.p95Latency > 20 || currentRun.p95Latency > 2000) {
      next.push({
        category: "Latency Optimization",

        priority: "high",

        action:
          "Increase worker concurrency and optimize distributed request handling.",

        reason:
          "Tail latency growth indicates infrastructure saturation during peak load.",

        impact:
          "Improves operational responsiveness and reduces tail latency amplification.",
      });
    }

    // REDIS

    const hasRedisPressure = anomalies.some(
      (a) => a.type === "Infrastructure Saturation",
    );

    if (hasRedisPressure) {
      next.push({
        category: "Redis Stabilization",

        priority: "high",

        action:
          "Increase Redis connection pooling and evaluate memory utilization patterns.",

        reason:
          "Operational telemetry indicates elevated infrastructure pressure under distributed execution.",

        impact:
          "Reduces queue latency and improves infrastructure throughput stability.",
      });
    }

    // FAILURE BURSTS

    if (deltas.failure > 10) {
      next.push({
        category: "Failure Recovery",

        priority: "critical",

        action:
          "Inspect upstream dependencies and implement adaptive retry backoff strategies.",

        reason:
          "Failure escalation patterns indicate growing infrastructure instability.",

        impact:
          "Improves resilience and reduces cascading operational failures.",
      });
    }

    // THROUGHPUT COLLAPSE

    if (deltas.rps < -15) {
      next.push({
        category: "Scaling Adjustment",

        priority: "critical",

        action:
          "Scale distributed workers horizontally and rebalance traffic distribution.",

        reason:
          "Throughput degradation indicates worker saturation and queue bottlenecks.",

        impact:
          "Improves distributed execution capacity and restores traffic throughput.",
      });
    }

    // PREDICTIVE RISK

    if (prediction.level === "High" || prediction.level === "Critical") {
      next.push({
        category: "Preventive Stabilization",

        priority: prediction.level === "Critical" ? "critical" : "high",

        action:
          "Reduce sustained traffic pressure and activate infrastructure recovery workflows.",

        reason:
          "Predictive intelligence indicates elevated probability of infrastructure degradation.",

        impact:
          "Prevents cascading instability and reduces operational failure amplification.",
      });
    }

    // FALLBACK

    if (next.length === 0) {
      next.push({
        category: "Operational Stability",

        priority: "low",

        action:
          "Continue monitoring infrastructure telemetry and distributed execution health.",

        reason: "No significant operational instability patterns detected.",

        impact:
          "Maintains infrastructure reliability and observability coverage.",
      });
    }

    return next;
  }, [anomalies, prediction, regression]);

  return recommendations;
}
