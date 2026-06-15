"use client";

import { useMemo } from "react";

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

export function useAiInsights({ metrics, incidents }) {
  return useMemo(() => {
    const findings = [];

    if (!metrics) {
      return findings;
    }

    const failure = toNumber(metrics.failure);
    const avgLatency = toNumber(metrics.avgLatency);
    const p95Latency = toNumber(metrics.p95Latency);
    const rps = toNumber(metrics.currentRps || metrics.rps);

    if (failure > 0) {
      findings.push({
        severity: "HIGH",

        title: "Failure Pattern Detected",

        description: `
          ${failure}
          failed requests were
          detected during execution.
        `,
      });
    }

    if (avgLatency > 0 && p95Latency > avgLatency * 1.5) {
      findings.push({
        severity: "MEDIUM",

        title: "Latency Degradation",

        description: `
          Tail latency is
          significantly higher
          than average latency.
        `,
      });
    }

    if (rps > 0 && rps < 30) {
      findings.push({
        severity: "LOW",

        title: "Throughput Bottleneck",

        description:
          "Observed throughput is below expected operating capacity.",
      });
    }

    if (incidents?.length > 5) {
      findings.push({
        severity: "MEDIUM",

        title: "Elevated Incident Activity",

        description: `
          ${incidents.length}
          operational incidents
          recorded recently.
        `,
      });
    }

    return findings;
  }, [metrics, incidents]);
}
