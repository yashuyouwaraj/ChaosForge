"use client";

import { useMemo } from "react";

import { useRootCauseAnalysis } from "@/hooks/useRootCauseAnalysis";
import { usePredictiveRisk } from "@/hooks/usePredictiveRisk";
import { useOperationalInsights } from "@/hooks/useOperationalInsights";

export function useExecutiveSummary(projectId, runId) {
  const causes = useRootCauseAnalysis(projectId, runId);

  const prediction = usePredictiveRisk(projectId, runId);

  const insights = useOperationalInsights(projectId, runId);

  const summary = useMemo(() => {
    const findings = [];

    if (prediction?.level === "Critical") {
      findings.push("Critical operational risk detected.");
    }

    if (prediction?.level === "High") {
      findings.push("Elevated degradation risk identified.");
    }

    if (causes.length > 0) {
      findings.push(`${causes.length} probable root causes identified.`);
    }

    if (insights.length > 0) {
      findings.push(
        `${insights.length} operational intelligence signals generated.`,
      );
    }

    let status = "Stable";

    if (prediction?.level === "High") {
      status = "Warning";
    }

    if (prediction?.level === "Critical") {
      status = "Critical";
    }

    return {
      status,

      headline:
        status === "Stable"
          ? "Infrastructure remained operationally stable during execution."
          : status === "Warning"
            ? "Infrastructure exhibited degradation indicators requiring attention."
            : "Infrastructure experienced elevated operational risk and instability.",

      findings,
    };
  }, [causes, prediction, insights]);

  return summary;
}
