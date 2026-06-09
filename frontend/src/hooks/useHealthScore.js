"use client";

import { useMemo } from "react";

import { usePredictiveRisk } from "@/hooks/usePredictiveRisk";
import { useRootCauseAnalysis } from "@/hooks/useRootCauseAnalysis";
import { useOperationalInsights } from "@/hooks/useOperationalInsights";
import { useRemediationRecommendations } from "@/hooks/useRemediationRecommendations";

export function useHealthScore(projectId, runId) {
  const prediction = usePredictiveRisk(projectId, runId);

  const causes = useRootCauseAnalysis(projectId, runId);

  const { insights } = useOperationalInsights(projectId, runId);

  const recommendations = useRemediationRecommendations(projectId, runId);

  return useMemo(() => {
    let score = 100;

    if (prediction?.level === "Critical") {
      score -= 25;
    } else if (prediction?.level === "High") {
      score -= 15;
    }

    score -= causes.length * 5;

    if (Array.isArray(insights)) {
      insights.forEach((insight) => {
        if (insight.severity === "critical") {
          score -= 10;
        }

        if (insight.severity === "high") {
          score -= 5;
        }
      });
    }

    if (recommendations.length > 3) {
      score -= 5;
    }

    score = Math.max(0, Math.min(100, score));

    return score;
  }, [prediction, causes, insights, recommendations]);
}
