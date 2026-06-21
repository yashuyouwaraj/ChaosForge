"use client";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useRootCauseAnalysis(projectId, runId, initialData = null) {
  const { intelligence } = useIntelligence(projectId, runId, initialData);

  if (!intelligence?.rootCause) {
    return [];
  }

  return intelligence.rootCause.map((cause) => ({
    confidence: cause.confidence,
    title: cause.title,
    description: cause.evidence,
    impact: cause.recommendation,
    severity: cause.severity,
    evidence: cause.evidence,
    recommendation: cause.recommendation,
  }));
}
