"use client";

import { useMemo } from "react";

import { useRegressionAnalysis } from "@/hooks/useRegressionAnalysis";
import { rate, toNumber } from "@/lib/metrics";

export function usePredictiveRisk(projectId, runId) {
  const regression = useRegressionAnalysis(projectId, runId);

  const prediction = useMemo(() => {
    if (!regression) {
      return null;
    }

    const { deltas, currentRun } = regression;

    const p95Delta = deltas?.p95Latency;
    const avgLatencyDelta = deltas?.avgLatency;
    const failureDelta = deltas?.failure;
    const rpsDelta = deltas?.rps;
    const failureRate = rate(currentRun.failure, currentRun.totalRequests);

    let risk = 10;

    // P95 LATENCY

    if (p95Delta > 20) {
      risk += 25;
    }

    if (p95Delta > 50) {
      risk += 20;
    }

    // AVG LATENCY

    if (avgLatencyDelta > 15) {
      risk += 15;
    }

    // FAILURE GROWTH

    if (failureDelta > 5) {
      risk += 25;
    }

    // THROUGHPUT COLLAPSE

    if (rpsDelta < -15) {
      risk += 20;
    }

    // HIGH ABSOLUTE LATENCY

    if (toNumber(currentRun.p95Latency) > 2000) {
      risk += 15;
    }

    // HIGH FAILURE RATE

    if (failureRate > 5) {
      risk += 15;
    }

    // CLAMP

    risk = Math.min(100, risk);

    // CLASSIFICATION

    let level = "Stable";

    if (risk >= 75) {
      level = "Critical";
    } else if (risk >= 50) {
      level = "High";
    } else if (risk >= 30) {
      level = "Moderate";
    }

    // FORECAST

    let forecast = `
Infrastructure behavior appears stable
with low probability of operational
degradation under sustained traffic.
      `.trim();

    if (level === "Moderate") {
      forecast = `
Operational telemetry indicates moderate
risk of infrastructure instability during
continued distributed load execution.
        `.trim();
    }

    if (level === "High") {
      forecast = `
High probability of infrastructure
degradation detected under sustained
peak traffic conditions.
        `.trim();
    }

    if (level === "Critical") {
      forecast = `
Critical operational instability predicted.
Infrastructure saturation and failure
escalation risks are increasing rapidly.
        `.trim();
    }

    const drivers = [];

    if (p95Delta > 20) {
      drivers.push("Tail latency growth");
    }

    if (failureDelta > 5 || failureRate > 5) {
      drivers.push("Failure escalation");
    }

    if (rpsDelta < -15) {
      drivers.push("Throughput degradation");
    }

    if (toNumber(currentRun.avgLatency) > 1000) {
      drivers.push("Infrastructure saturation");
    }

    if (drivers.length === 0) {
      drivers.push("Stable operational telemetry");
    }

    return {
      risk,

      level,

      forecast,

      drivers,
    };
  }, [regression]);

  return prediction;
}
