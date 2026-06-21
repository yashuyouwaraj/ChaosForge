"use client";

import { useMemo } from "react";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useAiPostmortemSummary(
  runId,
  initialRun = null,
  initialIncidents = null,
) {
  const projectId = initialRun?.projectId;
  const initialIntelligence =
    initialRun?.report?.intelligence || initialRun?.intelligence || null;

  const { intelligence } = useIntelligence(
    projectId,
    runId,
    initialIntelligence,
  );

  return useMemo(() => {
    if (!intelligence) {
      return null;
    }

    const { health, risk, overview, metrics, recommendations, rootCause } =
      intelligence;

    const failureRate =
      overview.totalRequests > 0
        ? ((overview.failure / overview.totalRequests) * 100).toFixed(1)
        : 0;

    const successRate =
      overview.totalRequests > 0
        ? ((overview.success / overview.totalRequests) * 100).toFixed(1)
        : 100;

    const insights = rootCause
      .filter((cause) => cause.title !== "No Dominant Failure Source")
      .map((cause) => cause.evidence);

    let operationalState = "Stable";

    if (risk.level === "critical") {
      operationalState = "Critical";
    } else if (risk.level === "high") {
      operationalState = "Degraded";
    } else if (risk.level === "moderate") {
      operationalState = "Recovering";
    }

    return {
      summary: intelligence.executiveSummary.headline,
      riskScore: risk.risk,
      grade: health.grade,
      failureRate,
      successRate,
      confidence: risk.confidence,
      operationalState,
      insights:
        insights.length > 0
          ? insights
          : ["Infrastructure execution remained within stable operational thresholds."],
      recommendations: recommendations.map(
        (item) => item.expectedImpact || item.reason || item.title,
      ),
    };
  }, [intelligence, initialIncidents?.length]);
}
