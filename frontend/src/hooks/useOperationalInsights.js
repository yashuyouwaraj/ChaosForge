"use client";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useOperationalInsights(projectId, runId, initialData = null) {
  const { intelligence, loading, error } = useIntelligence(
    projectId,
    runId,
    initialData,
  );

  return {
    insights: intelligence?.operationalInsights || [],
    loading,
    error,
  };
}
