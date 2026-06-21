"use client";

import { useIntelligence } from "@/hooks/useIntelligence";

export function usePredictiveRisk(projectId, runId, initialData = null) {
  const { intelligence } = useIntelligence(projectId, runId, initialData);

  if (!intelligence?.risk) {
    return null;
  }

  const { risk } = intelligence;

  return {
    risk: risk.risk,
    level:
      risk.level === "stable"
        ? "Stable"
        : risk.level.charAt(0).toUpperCase() + risk.level.slice(1),
    forecast: risk.forecast,
    drivers: risk.contributingFactors || [],
    confidence: risk.confidence,
  };
}
