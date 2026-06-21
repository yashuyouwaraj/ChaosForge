const { round } = require("../utils/metrics.util");

const buildExecutiveBrief = ({
  health,
  risk,
  overview,
  failureRate,
}) =>
  `Run health is ${health.status} at ${health.score}/100 with ${risk.level} predictive risk. The run processed ${overview.totalRequests} requests, recorded ${overview.failure} failures (${round(failureRate)}%), and reached ${overview.avgLatency}ms average latency with ${overview.p95Latency}ms p95 latency.`;

const buildExecutiveSummary = ({
  health,
  risk,
  overview,
  failureRate,
  infrastructureMemory,
  trends,
}) => {
  const trendNote = trends?.operationalTrend
    ? ` Operational trend vs previous run: ${trends.operationalTrend}.`
    : "";

  return `ChaosForge evaluated this run as ${health.status} with a health score of ${health.score}/100 (grade ${health.grade}). The simulation processed ${overview.totalRequests} total requests at approximately ${overview.rps} RPS, with ${overview.success} successful responses and ${overview.failure} failures for a ${round(failureRate)}% failure rate. Latency averaged ${overview.avgLatency}ms while p95 latency reached ${overview.p95Latency}ms, producing a ${risk.level} risk forecast: ${risk.forecast} Infrastructure memory contributed ${infrastructureMemory.totalPatterns || 0} historical pattern(s) for operational context.${trendNote}`;
};

module.exports = {
  buildExecutiveBrief,
  buildExecutiveSummary,
};
