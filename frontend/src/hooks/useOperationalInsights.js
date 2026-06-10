"use client";

import { useMemo } from "react";

import { usePredictiveRisk } from "@/hooks/usePredictiveRisk";

import { useAnomalyDetection } from "@/hooks/useAnomalyDetection";

import { useRemediationRecommendations } from "@/hooks/useRemediationRecommendations";

import { useInfrastructureMemory } from "@/hooks/useInfrastructureMemory";

export function useOperationalInsights(projectId, runId, runSnapshot = null) {
  const prediction = usePredictiveRisk(projectId, runId);

  const anomalies = useAnomalyDetection(projectId, runId, runSnapshot);

  const recommendations = useRemediationRecommendations(projectId, runId);

  const infrastructureMemory = useInfrastructureMemory(projectId);

  const insights = useMemo(() => {
    const next = [];
    const memory = infrastructureMemory.memory || [];

    if (!prediction) {
      return [];
    }

    // CRITICAL RISK + ANOMALIES

    if (prediction.level === "Critical" && anomalies.length >= 2) {
      next.push({
        severity: "critical",

        title: "Cascading Infrastructure Instability Risk",

        description: `
Predictive degradation signals combined
with realtime anomaly escalation indicate
elevated probability of cascading
operational instability during sustained
distributed execution.
          `.trim(),

        recommendation:
          "Reduce traffic pressure, stabilize worker throughput, and inspect infrastructure bottlenecks immediately.",
      });
    }

    // MEMORY + ANOMALIES

    const hasRecurringLatency = memory.some(
      (m) => m.type === "Recurring Tail Latency",
    );

    const hasLatencyAnomaly = anomalies.some(
      (a) => a.type === "Latency Anomaly",
    );

    if (hasRecurringLatency && hasLatencyAnomaly) {
      next.push({
        severity: "high",

        title: "Recurring Latency Degradation Pattern",

        description: `
Historical infrastructure memory and
active anomaly telemetry both indicate
repeated tail latency instability under
peak throughput conditions.
          `.trim(),

        recommendation:
          "Evaluate distributed request balancing and worker scaling efficiency.",
      });
    }

    // SATURATION CORRELATION

    const saturationDetected = anomalies.some(
      (a) => a.type === "Infrastructure Saturation",
    );

    if (saturationDetected && prediction.risk > 60) {
      next.push({
        severity: "high",

        title: "Distributed Saturation Correlation",

        description: `
Operational saturation signals correlate
strongly with predictive infrastructure
degradation forecasting.
          `.trim(),

        recommendation:
          "Increase horizontal worker scaling and reduce queue contention pressure.",
      });
    }

    // REMEDIATION COVERAGE

    if (recommendations.length >= 3) {
      next.push({
        severity: "moderate",

        title: "Multi-Layer Recovery Workflow Active",

        description: `
Autonomous remediation workflows are
actively responding to distributed
operational instability patterns.
          `.trim(),

        recommendation:
          "Continue monitoring infrastructure recovery and stabilization effectiveness.",
      });
    }

    // STABLE FALLBACK

    if (next.length === 0) {
      next.push({
        severity: "info",

        title: "Operational Intelligence Stable",

        description: `
Realtime telemetry, predictive analysis,
historical memory, and anomaly detection
indicate stable distributed infrastructure
behavior.
          `.trim(),

        recommendation:
          "Continue monitoring distributed telemetry and operational health signals.",
      });
    }

    return next;
  }, [prediction, anomalies, recommendations, infrastructureMemory.memory]);

  return {
    insights,
    loading:
      infrastructureMemory.loading ||
      (Boolean(projectId && runId) && !prediction),
    error: infrastructureMemory.error,
  };
}
