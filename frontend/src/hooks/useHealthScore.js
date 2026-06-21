"use client";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useHealthScore(projectId, runId, initialData = null) {
  const { intelligence } = useIntelligence(projectId, runId, initialData);
  return intelligence?.health?.score ?? 0;
}
