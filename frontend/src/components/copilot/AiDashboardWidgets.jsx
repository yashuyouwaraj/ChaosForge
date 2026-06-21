"use client";

import { AiResponseCards } from "./AiResponseCards";
import { useIntelligence } from "@/hooks/useIntelligence";

export function AiHealthSummaryWidget({ projectId, runId }) {
  const { intelligence, loading } = useIntelligence(projectId, runId);

  if (loading || !intelligence?.health) {
    return null;
  }

  return (
    <AiResponseCards
      response={{
        summary: intelligence.executiveBrief,
        cards: [
          {
            type: "health",
            title: "AI Health Summary",
            content: `${intelligence.health.score}/100 (${intelligence.health.status})`,
            severity:
              intelligence.health.status === "critical" ? "critical" : "info",
            confidence: intelligence.health.confidence,
          },
        ],
        confidence: intelligence.health.confidence,
      }}
    />
  );
}

export function AiRiskSummaryWidget({ projectId, runId }) {
  const { intelligence, loading } = useIntelligence(projectId, runId);

  if (loading || !intelligence?.risk) {
    return null;
  }

  return (
    <AiResponseCards
      response={{
        summary: intelligence.risk.forecast,
        cards: [
          {
            type: "risk",
            title: "AI Risk Summary",
            content: `${intelligence.risk.level} (${intelligence.risk.risk}%)`,
            severity:
              intelligence.risk.level === "critical" ? "critical" : "warning",
            confidence: intelligence.risk.confidence,
            items: intelligence.risk.contributingFactors || [],
          },
        ],
        confidence: intelligence.risk.confidence,
      }}
    />
  );
}

export function AiRecommendationsWidget({ projectId, runId }) {
  const { intelligence, loading } = useIntelligence(projectId, runId);

  if (loading || !intelligence?.recommendations?.length) {
    return null;
  }

  return (
    <AiResponseCards
      response={{
        summary: "Priority remediation recommendations from Intelligence Engine.",
        recommendations: intelligence.recommendations,
        confidence: intelligence.risk?.confidence,
      }}
    />
  );
}

export function AiMemoryInsightsWidget({ projectId, runId }) {
  const { intelligence, loading } = useIntelligence(projectId, runId);

  if (loading || !intelligence?.infrastructureMemory?.patterns?.length) {
    return null;
  }

  return (
    <AiResponseCards
      response={{
        summary: "Recurring infrastructure patterns from memory.",
        cards: intelligence.infrastructureMemory.patterns.slice(0, 3).map(
          (pattern) => ({
            type: "memory",
            title: pattern.title,
            content: pattern.description,
            severity: pattern.severity,
            confidence: pattern.confidence,
          }),
        ),
      }}
    />
  );
}

export function AiOperationalInsightsWidget({ projectId, runId }) {
  const { intelligence, loading } = useIntelligence(projectId, runId);

  if (loading || !intelligence?.operationalInsights?.length) {
    return null;
  }

  return (
    <AiResponseCards
      response={{
        summary: "Operational intelligence observations.",
        cards: intelligence.operationalInsights.map((insight) => ({
          type: "insight",
          title: insight.title,
          content: insight.description,
          severity: insight.severity,
        })),
      }}
    />
  );
}

export function AiExecutiveSummaryWidget({ projectId, runId }) {
  const { intelligence, loading } = useIntelligence(projectId, runId);

  if (loading || !intelligence?.executiveSummary) {
    return null;
  }

  return (
    <AiResponseCards
      response={{
        summary: intelligence.executiveSummary.text,
        findings: intelligence.executiveSummary.findings,
        confidence: intelligence.risk?.confidence,
      }}
    />
  );
}
