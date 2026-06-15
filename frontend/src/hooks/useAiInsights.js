"use client";

import { useMemo } from "react";

export function useAiInsights({ metrics, incidents }) {
  return useMemo(() => {
    if (!metrics) {
      return [];
    }

    const findings = [];

    // Failure Analysis
    if ((metrics.failure || 0) > 0) {
      findings.push({
        severity: "HIGH",
        priority: 3,

        title: "Failure Pattern Detected",

        description: `
${metrics.failure} failed requests were detected during recent infrastructure execution.
        `.trim(),
      });
    }

    // Latency Analysis
    if (
      metrics.avgLatency > 0 &&
      metrics.p95Latency > metrics.avgLatency * 1.5
    ) {
      findings.push({
        severity: "MEDIUM",
        priority: 2,

        title: "Latency Degradation",

        description: `
P95 latency reached ${metrics.p95Latency}ms while average latency remained ${metrics.avgLatency}ms, indicating tail latency pressure.
        `.trim(),
      });
    }

    // Throughput Analysis
    if (typeof metrics.rps === "number" && metrics.rps < 30) {
      findings.push({
        severity: "LOW",
        priority: 1,

        title: "Throughput Bottleneck",

        description: `
Observed throughput is ${metrics.rps} requests per second, which may indicate infrastructure constraints.
        `.trim(),
      });
    }

    // Incident Analysis
    if (Array.isArray(incidents) && incidents.length > 5) {
      findings.push({
        severity: "MEDIUM",
        priority: 2,

        title: "Elevated Incident Activity",

        description: `
${incidents.length} operational incidents were recorded across the infrastructure timeline.
        `.trim(),
      });
    }

    // Infrastructure Stability
    if (findings.length === 0 && metrics.avgLatency > 0) {
      findings.push({
        severity: "LOW",
        priority: 0,

        title: "Infrastructure Stable",

        description:
          "No significant anomalies, performance regressions, or operational risks were detected.",
      });
    }

    return findings.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }, [metrics, incidents]);
}
