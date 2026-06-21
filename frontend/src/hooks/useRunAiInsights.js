"use client";

import { useMemo } from "react";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useRunAiInsights(projectId, runId, initialData = null) {
  const { intelligence } = useIntelligence(projectId, runId, initialData);

  return useMemo(() => {
    if (!intelligence) {
      return {
        insights: [],
        intelligence: null,
      };
    }

    const insights = intelligence.operationalInsights.map((insight) => ({
      type: insight.severity,
      severity:
        insight.severity === "critical"
          ? "critical"
          : insight.severity === "warning" ||
              insight.severity === "high" ||
              insight.severity === "moderate"
            ? "warning"
            : "info",
      title: insight.title,
      description: insight.description,
      recommendation: insight.recommendation,
    }));

    const health = intelligence.health;
    const risk = intelligence.risk;
    const topCause = intelligence.rootCause[0];
    const topRecommendation = intelligence.recommendations[0];

    return {
      insights,
      intelligence: {
        currentHealth: `${health.score}/100`,
        riskLevel:
          risk.level === "stable"
            ? "Stable"
            : risk.level.charAt(0).toUpperCase() + risk.level.slice(1),
        mostProbableIssue: topCause?.title || "No dominant issue",
        predictedFailure: risk.forecast,
        confidence: `${risk.confidence}%`,
        recommendation:
          topRecommendation?.reason ||
          topCause?.recommendation ||
          "Continue monitoring throughput, latency trends, and operational health.",
      },
    };
  }, [intelligence]);
}
