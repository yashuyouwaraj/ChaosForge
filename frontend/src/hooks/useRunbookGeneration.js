"use client";

import { useMemo } from "react";

import { useRootCauseAnalysis } from "@/hooks/useRootCauseAnalysis";
import { useRemediationRecommendations } from "@/hooks/useRemediationRecommendations";

export function useRunbookGeneration(projectId, runId) {
  const causes = useRootCauseAnalysis(projectId, runId);

  const recommendations = useRemediationRecommendations(projectId, runId);

  const runbook = useMemo(() => {
    const steps = [];

    // SATURATION

    if (causes.some((c) => c.title === "Infrastructure Saturation")) {
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

    // LATENCY

    if (causes.some((c) => c.title === "Tail Latency Amplification")) {
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

    // FAILURES

    if (causes.some((c) => c.title === "Failure Escalation")) {
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

    // PREDICTIVE RISK

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
  }, [causes, recommendations]);

  return runbook;
}
