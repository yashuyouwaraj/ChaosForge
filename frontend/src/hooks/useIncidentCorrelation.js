"use client";

import { useMemo } from "react";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useIncidentCorrelation(projectId, runId, initialData = null) {
  const { intelligence } = useIntelligence(projectId, runId, initialData);

  return useMemo(() => {
    if (!intelligence) {
      return [];
    }

    const edges = [];
    const anomalies = intelligence.rootCause || [];
    const prediction = intelligence.risk;

    const hasSaturation = anomalies.some(
      (item) => item.title === "Infrastructure Saturation",
    );
    const hasLatency = anomalies.some(
      (item) => item.title === "Tail Latency Amplification",
    );
    const hasFailures = anomalies.some(
      (item) => item.title === "Failure Rate Escalation",
    );

    if (hasSaturation && hasLatency) {
      edges.push({
        source: "Infrastructure Saturation",
        target: "Tail Latency Growth",
      });
    }

    if (hasLatency && hasFailures) {
      edges.push({
        source: "Tail Latency Growth",
        target: "Failure Escalation",
      });
    }

    if (hasSaturation && hasFailures) {
      edges.push({
        source: "Infrastructure Saturation",
        target: "Failure Escalation",
      });
    }

    if (prediction?.level === "high" || prediction?.level === "critical") {
      edges.push({
        source: "Predictive Risk",
        target: "Operational Instability",
      });
    }

    anomalies.forEach((cause) => {
      edges.push({
        source: cause.title,
        target: "Infrastructure Impact",
      });
    });

    return edges;
  }, [intelligence]);
}
