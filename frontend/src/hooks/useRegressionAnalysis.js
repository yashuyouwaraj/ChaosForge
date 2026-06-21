"use client";

import { useMemo } from "react";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useRegressionAnalysis(projectId, runId, initialData = null) {
  const { intelligence } = useIntelligence(projectId, runId, initialData);

  return useMemo(() => {
    if (!intelligence) {
      return null;
    }

    const { trends, historicalComparison, metrics, overview } = intelligence;

    if (!historicalComparison?.hasPreviousRun) {
      return {
        hasPreviousRun: false,
        operationalTrend: trends?.operationalTrend || "No baseline",
        narrative:
          "No previous execution is available yet. Regression intelligence will compare this run once another completed run exists for the project.",
        insights: [
          "This is the first comparable execution for the selected project.",
        ],
        deltas: null,
        currentRun: {
          ...metrics,
          totalRequests: overview.totalRequests,
        },
        previousRun: null,
      };
    }

    const insights = [];

    if (trends.deltas?.p95Latency > 20) {
      insights.push(
        `P95 latency increased by ${trends.deltas.p95Latency}% indicating degraded tail performance under distributed load.`,
      );
    }

    if (trends.deltas?.avgLatency > 15) {
      insights.push(
        `Average latency increased by ${trends.deltas.avgLatency}% suggesting infrastructure saturation.`,
      );
    }

    if (trends.deltas?.failure > 10) {
      insights.push(
        `Failure rate increased by ${trends.deltas.failure} percentage points during simulation execution.`,
      );
    }

    if (trends.deltas?.rps > 15) {
      insights.push(
        `Traffic throughput improved by ${trends.deltas.rps}% compared to the previous execution.`,
      );
    }

    if (trends.deltas?.successRate < -5) {
      insights.push(
        `Operational success rate declined by ${Math.abs(trends.deltas.successRate)} percentage points.`,
      );
    }

    const operationalTrend = trends?.operationalTrend || "Stable";

    const narrative = `
Compared to the previous execution,
the infrastructure ${
      operationalTrend === "Improved"
        ? "demonstrated improved distributed throughput stability"
        : operationalTrend === "Degraded"
          ? "experienced degraded operational behavior under sustained load"
          : "maintained relatively stable distributed performance"
    } with ${
      trends.deltas?.p95Latency > 0
        ? "elevated tail latency characteristics."
        : "stable latency distribution."
    }
      `.trim();

    return {
      hasPreviousRun: true,
      operationalTrend,
      narrative,
      insights,
      deltas: trends.deltas,
      currentRun: {
        ...metrics,
        totalRequests: overview.totalRequests,
      },
      previousRun: {
        runId: historicalComparison.previousRunId,
      },
    };
  }, [intelligence]);
}
