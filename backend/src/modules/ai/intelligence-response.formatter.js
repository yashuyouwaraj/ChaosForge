const AIResponse = require("./models/ai-response.model");

const toCard = ({
  type,
  title,
  content,
  severity = "info",
  confidence = null,
  items = [],
  metadata = {},
}) => ({
  type,
  title,
  content,
  severity,
  confidence,
  items,
  metadata,
});

const formatRecommendations = (recommendations = []) =>
  recommendations.map((item) => ({
    priority: item.priority || "medium",
    recommendation: item.title || item.action || item.reason || "",
    expectedImpact: item.expectedImpact || item.impact || "",
    category: item.category || "Infrastructure",
    confidence: item.confidence ?? null,
  }));

const buildCardsFromIntelligence = (intelligence = {}) => {
  const cards = [];
  const { health, risk, rootCause, trends, infrastructureMemory } =
    intelligence;

  if (health) {
    cards.push(
      toCard({
        type: "health",
        title: "Health Score",
        content: `${health.score}/100 (${health.status}, grade ${health.grade})`,
        severity:
          health.status === "critical"
            ? "critical"
            : health.status === "warning"
              ? "warning"
              : "info",
        confidence: health.confidence ?? null,
        items: health.reasoning || [],
      }),
    );
  }

  if (risk) {
    cards.push(
      toCard({
        type: "risk",
        title: "Predictive Risk",
        content: `${risk.level} risk at ${risk.risk}%`,
        severity:
          risk.level === "critical"
            ? "critical"
            : risk.level === "high"
              ? "high"
              : "moderate",
        confidence: risk.confidence ?? null,
        items: [
          risk.forecast,
          ...(risk.contributingFactors || []),
        ].filter(Boolean),
      }),
    );
  }

  if (Array.isArray(rootCause) && rootCause.length > 0) {
    rootCause.slice(0, 5).forEach((cause) => {
      cards.push(
        toCard({
          type: "rootCause",
          title: cause.title,
          content: cause.evidence || cause.description || "",
          severity: cause.severity || "moderate",
          confidence: cause.confidence ?? null,
          items: [cause.recommendation].filter(Boolean),
        }),
      );
    });
  }

  if (trends?.operationalTrend) {
    cards.push(
      toCard({
        type: "trend",
        title: "Operational Trend",
        content: trends.operationalTrend,
        severity:
          trends.operationalTrend === "Regressed"
            ? "high"
            : trends.operationalTrend === "Improved"
              ? "info"
              : "moderate",
        items: trends.insights || [],
      }),
    );
  }

  if (infrastructureMemory?.patterns?.length) {
    cards.push(
      toCard({
        type: "memory",
        title: "Infrastructure Memory",
        content: `${infrastructureMemory.totalPatterns || infrastructureMemory.patterns.length} recurring pattern(s) detected`,
        severity: "warning",
        items: infrastructureMemory.patterns
          .slice(0, 5)
          .map(
            (pattern) =>
              `${pattern.title} (${pattern.severity}, detected ${pattern.detectionCount || 1}x)`,
          ),
      }),
    );
  }

  if (intelligence.deploymentReadiness) {
    const readiness = intelligence.deploymentReadiness;
    cards.push(
      toCard({
        type: "readiness",
        title: "Deployment Readiness",
        content: `Overall ${readiness.overall}/100`,
        severity:
          readiness.overall >= 75
            ? "info"
            : readiness.overall >= 50
              ? "warning"
              : "critical",
        items: [
          `Availability ${readiness.availability}/100`,
          `Reliability ${readiness.reliability}/100`,
          `Performance ${readiness.performance}/100`,
          `Resilience ${readiness.resilience}/100`,
          `Observability ${readiness.observability}/100`,
        ],
      }),
    );
  }

  return cards;
};

const formatFromIntelligence = ({
  skill,
  intelligence,
  extraCards = [],
  summaryOverride = null,
}) => {
  const cards = [...buildCardsFromIntelligence(intelligence), ...extraCards];
  const recommendations = formatRecommendations(intelligence.recommendations);

  return new AIResponse({
    skill,
    summary:
      summaryOverride ||
      intelligence.executiveSummary?.text ||
      intelligence.executiveBrief ||
      "Intelligence analysis complete.",
    cards,
    findings: intelligence.executiveSummary?.findings || [],
    recommendations,
    confidence:
      intelligence.risk?.confidence ??
      intelligence.health?.confidence ??
      85,
    metadata: {
      source: "intelligence-engine",
      generatedAt: intelligence.generatedAt,
      projectId: intelligence.projectId,
      runId: intelligence.runId,
      health: intelligence.health,
      risk: intelligence.risk,
    },
  });
};

const mergeLlmResponse = (formatted, parsed = {}) => {
  const llmCards = Array.isArray(parsed.cards) ? parsed.cards : [];

  return new AIResponse({
    skill: formatted.skill,
    summary: parsed.executiveSummary || parsed.summary || formatted.summary,
    cards: llmCards.length > 0 ? llmCards : formatted.cards,
    findings:
      parsed.findings?.length > 0 ? parsed.findings : formatted.findings,
    recommendations:
      parsed.recommendations?.length > 0
        ? parsed.recommendations
        : formatted.recommendations,
    confidence: parsed.confidence ?? formatted.confidence,
    metadata: {
      ...formatted.metadata,
      ...(parsed.metadata || {}),
      rootCause: parsed.rootCause || formatted.metadata?.rootCause,
      providerEnriched: true,
    },
  });
};

module.exports = {
  formatFromIntelligence,
  mergeLlmResponse,
  buildCardsFromIntelligence,
  formatRecommendations,
  toCard,
};
