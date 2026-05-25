"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { loadRunDetails } from "@/components/reports/reportData";

export function useAiPostmortemSummary(
  runId,
  initialRun = null,
  initialIncidents = null,
) {
  const [run, setRun] = useState(null);

  const [incidents, setIncidents] = useState([]);
  const currentRun = initialRun || run;
  const currentIncidents = initialIncidents || incidents;

  useEffect(() => {
    if (initialRun && initialIncidents) {
      return;
    }

    if (!runId) {
      return;
    }

    let ignore = false;

    const load = async () => {
      try {
        const runData = await loadRunDetails(runId);
        const incidentData = await api(`/api/incidents/${runId}`).catch(
          (incidentError) => {
            console.error(incidentError);
            return [];
          },
        );

        if (!ignore && !initialRun) {
          setRun(runData);
        }

        if (!ignore && !initialIncidents) {
          setIncidents(Array.isArray(incidentData) ? incidentData : []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [initialIncidents, initialRun, runId]);

  const intelligence = useMemo(() => {
    if (!currentRun) {
      return null;
    }

    const insights = [];

    let riskScore = 0;

    // FAILURE RATE

    const failureRate =
      currentRun.totalRequests > 0
        ? ((currentRun.failure / currentRun.totalRequests) * 100).toFixed(1)
        : 0;

    // SUCCESS RATE

    const successRate =
      currentRun.totalRequests > 0
        ? ((currentRun.success / currentRun.totalRequests) * 100).toFixed(1)
        : 100;

    // RISK CALCULATION

    if (Number(failureRate) > 10) {
      riskScore += 25;

      insights.push(
        "Infrastructure failure rate exceeded operational thresholds.",
      );
    }

    if (currentRun.avgLatency > 1000) {
      riskScore += 20;

      insights.push(
        "Average latency increased under sustained distributed traffic.",
      );
    }

    if (currentRun.p95Latency > 2000) {
      riskScore += 30;

      insights.push("Tail latency degradation indicates backend saturation.");
    }

    if (currentIncidents.length > 5) {
      riskScore += 20;

      insights.push(
        "Multiple operational incidents were detected during execution.",
      );
    }

    if (currentRun.failure > 0) {
      riskScore += 10;
    }

    // RELIABILITY GRADE

    let grade = "A";

    if (riskScore >= 80) {
      grade = "D";
    } else if (riskScore >= 60) {
      grade = "C";
    } else if (riskScore >= 30) {
      grade = "B";
    }

    // SUMMARY

    let summary =
      "Infrastructure execution remained stable during the simulation lifecycle.";

    if (riskScore >= 60) {
      summary =
        "Distributed infrastructure instability was detected during high-load execution phases.";
    } else if (riskScore >= 30) {
      summary =
        "Minor operational degradation was detected under sustained traffic conditions.";
    }

    // RECOMMENDATIONS

    const recommendations = [];

    if (currentRun.avgLatency > 1000) {
      recommendations.push(
        "Inspect backend bottlenecks and distributed queue pressure.",
      );
    }

    if (Number(failureRate) > 10) {
      recommendations.push(
        "Investigate upstream failures and worker instability.",
      );
    }

    if (currentRun.p95Latency > 2000) {
      recommendations.push(
        "Optimize request batching and infrastructure scaling.",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Infrastructure remained operationally healthy during execution.",
      );
    }

    // Ai Confidence
    let confidence = 95;

    if (currentIncidents.length > 5) {
      confidence -= 10;
    }

    if (currentRun.failure > 0) {
      confidence -= 8;
    }

    if (currentRun.p95Latency > 2000) {
      confidence -= 12;
    }

    if (currentRun.avgLatency > 1000) {
      confidence -= 5;
    }

    confidence = Math.max(55, confidence);

    let operationalState = "Stable";

    if (riskScore >= 80) {
      operationalState = "Critical";
    } else if (riskScore >= 60) {
      operationalState = "Degraded";
    } else if (riskScore >= 30) {
      operationalState = "Recovering";
    }

    return {
      summary,

      riskScore,

      grade,

      failureRate,

      successRate,

      confidence,

      operationalState,

      insights,

      recommendations,
    };
  }, [currentRun, currentIncidents.length]);

  return intelligence;
}
