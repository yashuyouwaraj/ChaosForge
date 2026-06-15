"use client";

import { useMemo } from "react";

import { useAiAnalysis } from "@/hooks/useAiAnalysis";

export function useExecutiveSummary(projectId, runId) {
  const { analysis, loading } = useAiAnalysis(projectId, runId);

  const summary = useMemo(() => {
    if (!analysis) {
      return {
        status: "Loading",
        headline: "Generating AI operational summary...",
        findings: [],
      };
    }

    const findings = [];

    findings.push(`Operational health score: ${analysis.score}/100.`);

    findings.push(`Success rate: ${analysis.successRate.toFixed(1)}%`);

    findings.push(`${analysis.metrics.totalRequests} requests processed.`);

    findings.push(`${analysis.metrics.rps} requests per second achieved.`);

    if (analysis.anomalies.length > 0) {
      findings.push(`${analysis.anomalies.length} anomaly signals detected.`);
    }

    let status = "Healthy";

    if (analysis.score < 90) {
      status = "Warning";
    }

    if (analysis.score < 70) {
      status = "Critical";
    }

    return {
      status,

      headline:
        status === "Healthy"
          ? "Infrastructure executed successfully with strong reliability and performance."
          : status === "Warning"
            ? "Operational degradation indicators detected during execution."
            : "Critical operational issues detected requiring immediate investigation.",

      findings,
    };
  }, [analysis]);

  return {
    ...summary,
    loading,
  };
}
