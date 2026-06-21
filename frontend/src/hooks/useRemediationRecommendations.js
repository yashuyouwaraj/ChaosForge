"use client";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useRemediationRecommendations(
  projectId,
  runId,
  initialData = null,
) {
  const { intelligence } = useIntelligence(projectId, runId, initialData);

  if (!intelligence?.recommendations) {
    return [];
  }

  return intelligence.recommendations.map((item) => ({
    category: item.category,
    priority: item.priority,
    action: item.title,
    reason: item.reason,
    impact: item.expectedImpact,
    confidence: item.confidence,
  }));
}
