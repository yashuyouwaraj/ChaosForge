"use client";

import { useMemo } from "react";

import { useIntelligence } from "@/hooks/useIntelligence";

const mapRootCauseToAnomaly = (cause) => ({
  type: cause.title,
  severity: cause.severity,
  score: cause.confidence,
  description: cause.evidence,
  recommendation: cause.recommendation,
});

export function useAnomalyDetection(
  projectId,
  runId,
  initialData = null,
) {
  const { intelligence } = useIntelligence(projectId, runId, initialData);

  return useMemo(() => {
    if (!intelligence?.rootCause) {
      return [];
    }

    return intelligence.rootCause
      .filter((cause) => cause.title !== "No Dominant Failure Source")
      .map(mapRootCauseToAnomaly);
  }, [intelligence]);
}
