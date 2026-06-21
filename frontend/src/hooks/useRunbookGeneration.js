"use client";

import { useMemo } from "react";

import { useIntelligence } from "@/hooks/useIntelligence";

export function useRunbookGeneration(projectId, runId, initialData = null) {
  const { intelligence } = useIntelligence(projectId, runId, initialData);

  return useMemo(() => {
    if (!intelligence) {
      return [];
    }

    const causes = intelligence.rootCause || [];
    const recommendations = intelligence.recommendations || [];
    const steps = [];

    if (causes.some((cause) => cause.title === "Infrastructure Saturation")) {
      steps.push({
        title: "Scale Worker Capacity",
        description:
          "Increase worker count or processing capacity to reduce queue pressure.",
      });
      steps.push({
        title: "Verify Queue Health",
        description: "Inspect request backlog and processing throughput.",
      });
    }

    if (causes.some((cause) => cause.title === "Tail Latency Amplification")) {
      steps.push({
        title: "Analyze Slow Requests",
        description:
          "Review high-latency endpoints and downstream dependencies.",
      });
      steps.push({
        title: "Monitor Recovery",
        description: "Track p95 latency and verify stabilization.",
      });
    }

    if (causes.some((cause) => cause.title === "Failure Rate Escalation")) {
      steps.push({
        title: "Inspect Upstream Dependencies",
        description:
          "Check external services, APIs, and infrastructure health.",
      });
      steps.push({
        title: "Enable Recovery Workflow",
        description:
          "Reduce failure amplification and verify service recovery.",
      });
    }

    if (recommendations.length >= 3) {
      steps.push({
        title: "Reduce Traffic Pressure",
        description:
          "Temporarily decrease load until operational stability returns.",
      });
    }

    if (steps.length === 0) {
      steps.push({
        title: "Continue Monitoring",
        description: "No active remediation workflow required.",
      });
    }

    return steps.map((step, index) => ({
      ...step,
      order: index + 1,
    }));
  }, [intelligence]);
}
