"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { percentDelta, pointDelta, rate, toNumber } from "@/lib/metrics";

const roundDelta = (value) => {
  if (value == null) {
    return null;
  }

  return Math.round(value);
};

const formatPointDelta = (value) => {
  if (value == null) {
    return null;
  }

  return Math.round(value * 10) / 10;
};

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
    if (!currentRun) {
      return null;
    }

    if (!previousRun) {
      return {
        hasPreviousRun: false,

        operationalTrend: "No baseline",

        narrative:
          "No previous execution is available yet. Regression intelligence will compare this run once another completed run exists for the project.",

        insights: [
          "This is the first comparable execution for the selected project.",
        ],

        deltas: null,

        currentRun,

        previousRun: null,
      };
    }

    const p95Delta = roundDelta(
      percentDelta(currentRun.p95Latency, previousRun.p95Latency),
    );

    const avgLatencyDelta = roundDelta(
      percentDelta(currentRun.avgLatency, previousRun.avgLatency),
    );

    const failureRateCurrent = rate(
      currentRun.failure,
      currentRun.totalRequests,
    );

    const failureRatePrevious = rate(
      previousRun.failure,
      previousRun.totalRequests,
    );

    const failureDelta = formatPointDelta(
      pointDelta(failureRateCurrent, failureRatePrevious),
    );

    const rpsDelta = roundDelta(percentDelta(currentRun.rps, previousRun.rps));

    const successRateCurrent = rate(
      currentRun.success,
      currentRun.totalRequests,
    );

    const successRatePrevious = rate(
      previousRun.success,
      previousRun.totalRequests,
    );

    const successDelta = formatPointDelta(
      pointDelta(successRateCurrent, successRatePrevious),
    );

    const insights = [];

    if (p95Delta == null && toNumber(currentRun.p95Latency) > 0) {
      insights.push(
        "P95 latency is now measurable, but the previous run had no valid latency baseline.",
      );
    } else if (p95Delta > 20) {
      insights.push(
        `P95 latency increased by ${p95Delta}% indicating degraded tail performance under distributed load.`,
      );
    }

    if (avgLatencyDelta == null && toNumber(currentRun.avgLatency) > 0) {
      insights.push(
        "Average latency is now measurable, but the previous run had no valid latency baseline.",
      );
    } else if (avgLatencyDelta > 15) {
      insights.push(
        `Average latency increased by ${avgLatencyDelta}% suggesting infrastructure saturation.`,
      );
    }

    if (failureDelta > 10) {
      insights.push(
        `Failure rate increased by ${failureDelta} percentage points during simulation execution.`,
      );
    }

    if (rpsDelta > 15) {
      insights.push(
        `Traffic throughput improved by ${rpsDelta}% compared to the previous execution.`,
      );
    }

    if (successDelta < -5) {
      insights.push(
        `Operational success rate declined by ${Math.abs(successDelta)} percentage points.`,
      );
    }

    let operationalTrend = "Stable";

    const latencyDegraded =
      p95Delta == null
        ? toNumber(currentRun.p95Latency) > toNumber(previousRun.p95Latency)
        : p95Delta > 25;

    const avgLatencyDegraded =
      avgLatencyDelta == null
        ? toNumber(currentRun.avgLatency) > toNumber(previousRun.avgLatency)
        : avgLatencyDelta > 20;

    const successDegraded = successDelta != null && successDelta < -5;

    const failureDegraded = failureDelta != null && failureDelta > 5;

    const latencyImproved =
      p95Delta != null && avgLatencyDelta != null && p95Delta < -10 && avgLatencyDelta <= 0;

    const reliabilityImproved =
      (successDelta == null || successDelta >= 0) &&
      (failureDelta == null || failureDelta <= 0);

    if (
      (latencyDegraded || avgLatencyDegraded) &&
      (successDegraded || failureDegraded)
    ) {
      operationalTrend = "Degraded";
    } else if (successDegraded || failureDegraded) {
      operationalTrend = "Degraded";
    } else if (
      reliabilityImproved &&
      (latencyImproved || (rpsDelta != null && rpsDelta > 20))
    ) {
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
      p95Delta == null
        ? "a newly established latency baseline."
        : p95Delta > 0
        ? "elevated tail latency characteristics."
        : "stable latency distribution."
    }
      `.trim();

    return {
      hasPreviousRun: true,

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
