const pct = (a, b) => {
  if (!a && !b) return 0;
  if (!a && b) return 100;
  return Math.round(((b - a) / a) * 100);
};

const trend = (delta, betterIfHigher = true) => {
  if (delta === 0) return "no_change";
  if (betterIfHigher) return delta > 0 ? "improvement" : "degraded";
  return delta < 0 ? "improvement" : "degraded";
};

const compareRuns = (A, B) => {
  //A = Baseline , B = Candidate
  const rpsDelta = pct(A.rps, B.rps);
  const avgLatDelta = pct(A.avgLatency, B.avgLatency);
  const p95Delta = pct(A.p95Latency, B.p95Latency);
  const failRateA = A.totalRequests ? (A.failure / A.totalRequests) * 100 : 0;
  const failRateB = B.totalRequests ? (B.failure / B.totalRequests) * 100 : 0;
  const failDelta = Math.round(failRateB - failRateA);
  const successDelta = pct(A.success, B.success);

  const result = {
    baseRundId: A.runId,
    compareRunId: B.runId,

    deltas: {
      rps: rpsDelta, // higher is better
      avgLatency: avgLatDelta, // lower is better
      p95Latency: p95Delta, // lower is better
      failureRate: failDelta, // lower is better
      success: successDelta, // higher is better
    },

    trends: {
      rps: trend(rpsDelta, true),
      avgLatency: trend(avgLatDelta, false),
      p95Latency: trend(p95Delta, false),
      failureRate: trend(failDelta, false),
      success: trend(successDelta, true),
    },

    insights: [],
  };
  // 🔥 simple insights (clear & deterministic)
  if (result.trends.rps === "improvement")
    result.insights.push("Throughput improved (RPS increased).");
  if (result.trends.rps === "degraded")
    result.insights.push("Throughput dropped (RPS decreased).");

  if (result.trends.avgLatency === "improvement")
    result.insights.push("Average latency improved.");
  if (result.trends.avgLatency === "degraded")
    result.insights.push("Average latency increased under load.");

  if (result.trends.p95Latency === "degraded")
    result.insights.push(
      "Tail latency (P95) worsened—peak performance issues.",
    );

  if (result.trends.failureRate === "degraded")
    result.insights.push("Failure rate increased—system likely saturated.");

  if (result.trends.failureRate === "improvement")
    result.insights.push("Failure rate reduced—stability improved.");

  if (result.trends.success === "improvement")
    result.insights.push("Success rate increased—better reliability.");

  if (result.trends.success === "degraded")
    result.insights.push("Success rate dropped—system reliability issues.");

  return result;
};

module.exports = { compareRuns };