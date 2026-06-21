"use client";

import { useMemo } from "react";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useExecutiveBrief(projectId, runId, run, initialData = null) {
  const { intelligence } = useIntelligence(projectId, runId, initialData);

  return useMemo(() => {
    if (!intelligence) {
      return {
        score: 0,
        assessment: "Loading",
        impact: "Unknown",
        action: "Loading intelligence...",
        findings: [],
      };
    }

    const score = intelligence.health.score;
    const rootCauses = intelligence.rootCause || [];
    const prediction = intelligence.risk;

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

    if (prediction?.level === "critical") {
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
        `Health score evaluated at ${score}/100 (grade ${intelligence.health.grade})`,
        `${rootCauses.length} probable root causes identified`,
        prediction?.level
          ? `Predictive risk level: ${prediction.level}`
          : "No elevated predictive risk detected",
        `Throughput: ${run?.rps || intelligence.overview?.rps || 0} RPS`,
      ],
    };
  }, [intelligence, run]);
}
