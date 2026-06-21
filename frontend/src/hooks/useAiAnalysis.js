"use client";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useAiAnalysis(projectId, runId, initialData = null) {
  const { intelligence, loading, error } = useIntelligence(
    projectId,
    runId,
    initialData,
  );

  if (!intelligence) {
    return { analysis: null, loading, error };
  }

  const successRate =
    intelligence.metrics.totalRequests > 0
      ? (intelligence.metrics.success / intelligence.metrics.totalRequests) * 100
      : 0;

  return {
    analysis: {
      generatedAt: intelligence.generatedAt,
      metrics: intelligence.metrics,
      score: intelligence.health.score,
      anomalies: intelligence.rootCause.map((cause) => ({
        severity:
          cause.severity === "critical"
            ? "critical"
            : cause.severity === "high"
              ? "high"
              : cause.severity === "moderate"
                ? "medium"
                : "info",
        title: cause.title,
        description: cause.evidence,
      })),
      insights: intelligence.operationalInsights.map((insight) => ({
        severity:
          insight.severity === "critical"
            ? "critical"
            : insight.severity === "warning" ||
                insight.severity === "high" ||
                insight.severity === "moderate"
              ? "warning"
              : "info",
        title: insight.title,
        explanation: insight.description,
      })),
      recommendations: intelligence.recommendations.map(
        (item) => item.reason || item.title,
      ),
      successRate,
    },
    loading,
    error,
  };
}
