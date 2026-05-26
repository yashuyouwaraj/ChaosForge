"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";

export function useRegressionAnalysis(projectId, runId) {
  const [currentRun, setCurrentRun] = useState(null);

  const [previousRun, setPreviousRun] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!projectId || !runId) {
          return;
        }

        const runs = await api(`/runs/${projectId}`);

        const sortedRuns = [...runs].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        const current = sortedRuns.find((run) => run.runId === runId);

        const currentIndex = sortedRuns.findIndex((run) => run.runId === runId);

        const previous =
          currentIndex >= 0 ? sortedRuns[currentIndex + 1] : null;

        setCurrentRun(current || null);

        setPreviousRun(previous || null);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [projectId, runId]);

  const analysis = useMemo(() => {
    if (!currentRun || !previousRun) {
      return null;
    }

    const calculateDelta = (current, previous) => {
      if (!previous || previous === 0) {
        return 0;
      }

      return Math.round(((current - previous) / previous) * 100);
    };

    const p95Delta = calculateDelta(
      currentRun.p95Latency || 0,
      previousRun.p95Latency || 0,
    );

    const avgLatencyDelta = calculateDelta(
      currentRun.avgLatency || 0,
      previousRun.avgLatency || 0,
    );

    const failureDelta = calculateDelta(
      currentRun.failure || 0,
      previousRun.failure || 0,
    );

    const rpsDelta = calculateDelta(currentRun.rps || 0, previousRun.rps || 0);

    const successRateCurrent =
      currentRun.totalRequests > 0
        ? Math.round((currentRun.success / currentRun.totalRequests) * 100)
        : 100;

    const successRatePrevious =
      previousRun.totalRequests > 0
        ? Math.round((previousRun.success / previousRun.totalRequests) * 100)
        : 100;

    const successDelta = successRateCurrent - successRatePrevious;

    const insights = [];

    if (p95Delta > 20) {
      insights.push(
        `P95 latency increased by ${p95Delta}% indicating degraded tail performance under distributed load.`,
      );
    }

    if (avgLatencyDelta > 15) {
      insights.push(
        `Average latency increased by ${avgLatencyDelta}% suggesting infrastructure saturation.`,
      );
    }

    if (failureDelta > 10) {
      insights.push(
        `Failure rate increased by ${failureDelta}% during simulation execution.`,
      );
    }

    if (rpsDelta > 15) {
      insights.push(
        `Traffic throughput improved by ${rpsDelta}% compared to the previous execution.`,
      );
    }

    if (successDelta < -5) {
      insights.push(
        `Operational success rate declined by ${Math.abs(successDelta)}%.`,
      );
    }

    let operationalTrend = "Stable";

    if (p95Delta > 25 || failureDelta > 15) {
      operationalTrend = "Degraded";
    } else if (rpsDelta > 20 && failureDelta <= 0) {
      operationalTrend = "Improved";
    }

    const narrative = `
Compared to the previous execution,
the infrastructure ${
      operationalTrend === "Improved"
        ? "demonstrated improved distributed throughput stability"
        : operationalTrend === "Degraded"
          ? "experienced degraded operational behavior under sustained load"
          : "maintained relatively stable distributed performance"
    } with ${
      p95Delta > 0
        ? "elevated tail latency characteristics."
        : "stable latency distribution."
    }
      `.trim();

    return {
      operationalTrend,

      narrative,

      insights,

      deltas: {
        p95Latency: p95Delta,

        avgLatency: avgLatencyDelta,

        failure: failureDelta,

        rps: rpsDelta,

        successRate: successDelta,
      },

      currentRun,

      previousRun,
    };
  }, [currentRun, previousRun]);

  return analysis;
}
