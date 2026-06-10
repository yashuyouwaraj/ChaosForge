"use client";

import { useMemo } from "react";

import { useHealthScore } from "@/hooks/useHealthScore";
import { usePredictiveRisk } from "@/hooks/usePredictiveRisk";
import { useRootCauseAnalysis } from "@/hooks/useRootCauseAnalysis";

export function useExecutiveBrief(projectId, runId, run) {
  const score = useHealthScore(projectId, runId);

  const prediction = usePredictiveRisk(projectId, runId);

  const rootCauses = useRootCauseAnalysis(projectId, runId);

  return useMemo(() => {
    let assessment = "Excellent";

    let impact = "Low";

    let action = "Continue monitoring.";

    if (score < 90) {
      assessment = "Good";
    }

    if (score < 75) {
      assessment = "Warning";
      impact = "Moderate";
    }

    if (score < 50) {
      assessment = "Critical";
      impact = "High";
    }

    if (prediction?.level === "Critical") {
      action = "Immediate remediation recommended.";
    }

    if (rootCauses.length > 0) {
      action =
        "Investigate identified root causes and execute recovery workflow.";
    }

    return {
      score,
      assessment,
      impact,
      action,
      findings: [
        `Health score evaluated at ${score}/100`,
        `${rootCauses.length} probable root causes identified`,
        prediction?.level
          ? `Predictive risk level: ${prediction.level}`
          : "No elevated predictive risk detected",
        `Throughput: ${run?.rps || 0} RPS`,
      ],
    };
  }, [score, prediction, rootCauses, run]);
}
