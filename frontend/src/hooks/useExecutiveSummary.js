"use client";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useExecutiveSummary(projectId, runId, initialData = null) {
  const { intelligence, loading } = useIntelligence(
    projectId,
    runId,
    initialData,
  );

  if (!intelligence) {
    return {
      status: loading ? "Loading" : "Unknown",
      headline: loading
        ? "Generating AI operational summary..."
        : "Intelligence unavailable.",
      findings: [],
      loading,
    };
  }

  const summary = intelligence.executiveSummary;

  return {
    status: summary.status,
    headline: summary.headline,
    findings: summary.findings,
    loading,
  };
}
