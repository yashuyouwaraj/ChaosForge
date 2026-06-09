"use client";

import { useMemo } from "react";

import { useAnomalyDetection } from "@/hooks/useAnomalyDetection";
import { usePredictiveRisk } from "@/hooks/usePredictiveRisk";
import { useInfrastructureMemory } from "@/hooks/useInfrastructureMemory";

export function useRootCauseAnalysis(projectId, runId) {
  const anomalies = useAnomalyDetection(projectId, runId);

  const prediction = usePredictiveRisk(projectId, runId);

  const { memory } = useInfrastructureMemory(projectId);

  const analysis = useMemo(() => {
    const causes = [];

    if (anomalies.some((a) => a.type === "Infrastructure Saturation")) {
      causes.push({
        confidence: 92,

        title: "Infrastructure Saturation",

        description:
          "Worker capacity and request processing throughput appear insufficient for current traffic demand.",

        impact:
          "Queue pressure increases latency and amplifies downstream failures.",
      });
    }

    if (anomalies.some((a) => a.type === "Latency Anomaly")) {
      causes.push({
        confidence: 88,

        title: "Tail Latency Amplification",

        description:
          "Request completion times are diverging significantly under distributed execution.",

        impact:
          "Slow responses increase timeout probability and reduce operational efficiency.",
      });
    }

    if (anomalies.some((a) => a.type === "Failure Burst")) {
      causes.push({
        confidence: 84,

        title: "Failure Escalation",

        description:
          "Failure growth suggests instability in upstream dependencies or overloaded infrastructure.",

        impact: "Service reliability decreases under sustained load.",
      });
    }

    if (prediction?.level === "Critical") {
      causes.push({
        confidence: 95,

        title: "Predicted System Degradation",

        description:
          "Predictive intelligence indicates a high probability of operational instability.",

        impact:
          "Infrastructure resilience may degrade rapidly during continued traffic growth.",
      });
    }

    const recurringPattern = Array.isArray(memory)
      ? memory.find((m) => m.severity === "high" || m.severity === "critical")
      : null;

    if (recurringPattern) {
      causes.push({
        confidence: 90,

        title: "Recurring Historical Pattern",

        description: recurringPattern.description,

        impact:
          "Historical operational signatures indicate repeated degradation behavior.",
      });
    }

    causes.sort((a, b) => b.confidence - a.confidence);

    return causes;
  }, [anomalies, prediction, memory]);

  return analysis;
}
