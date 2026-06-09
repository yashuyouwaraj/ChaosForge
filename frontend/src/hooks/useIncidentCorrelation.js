"use client";

import { useMemo } from "react";

import { useAnomalyDetection } from "@/hooks/useAnomalyDetection";
import { usePredictiveRisk } from "@/hooks/usePredictiveRisk";
import { useRootCauseAnalysis } from "@/hooks/useRootCauseAnalysis";

export function useIncidentCorrelation(projectId, runId) {
  const anomalies = useAnomalyDetection(projectId, runId);

  const prediction = usePredictiveRisk(projectId, runId);

  const rootCauses = useRootCauseAnalysis(projectId, runId);

  const chains = useMemo(() => {
    const edges = [];

    const hasSaturation = anomalies.some(
      (a) => a.type === "Infrastructure Saturation",
    );

    const hasLatency = anomalies.some((a) => a.type === "Latency Anomaly");

    const hasFailures = anomalies.some((a) => a.type === "Failure Burst");

    // Saturation → Latency

    if (hasSaturation && hasLatency) {
      edges.push({
        source: "Infrastructure Saturation",

        target: "Tail Latency Growth",
      });
    }

    // Latency → Failures

    if (hasLatency && hasFailures) {
      edges.push({
        source: "Tail Latency Growth",

        target: "Failure Escalation",
      });
    }

    // Saturation → Failures

    if (hasSaturation && hasFailures) {
      edges.push({
        source: "Infrastructure Saturation",

        target: "Failure Escalation",
      });
    }

    // Predictive Risk

    if (prediction?.level === "High" || prediction?.level === "Critical") {
      edges.push({
        source: "Predictive Risk",

        target: "Operational Instability",
      });
    }

    // Root Cause Correlations

    rootCauses.forEach((cause) => {
      edges.push({
        source: cause.title,

        target: "Infrastructure Impact",
      });
    });

    return edges;
  }, [anomalies, prediction, rootCauses]);

  return chains;
}
