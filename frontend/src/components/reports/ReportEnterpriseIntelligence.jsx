"use client";

const numberOr = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const score = (value) => Math.max(0, Math.min(100, Math.round(value)));

const rate = (part, total) => {
  const safeTotal = numberOr(total);
  return safeTotal > 0 ? (numberOr(part) / safeTotal) * 100 : 0;
};

const titleCase = (value = "") =>
  String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
};

const getHealthStatus = (value) => {
  if (value >= 90) {
    return "Excellent";
  }

  if (value >= 75) {
    return "Good";
  }

  if (value >= 50) {
    return "Warning";
  }

  return "Critical";
};

const buildReadiness = (run) => {
  const successRate = rate(run.success, run.totalRequests) || 100;
  const failureRate = rate(run.failure, run.totalRequests);
  const resilienceRate = rate(run.chaosSuccess, run.chaosInjected);
  const performancePenalty =
    Math.max(0, numberOr(run.avgLatency) - 500) / 30 +
    Math.max(0, numberOr(run.p95Latency) - 1000) / 40;

  return [
    ["Availability", score(successRate)],
    ["Reliability", score(100 - failureRate * 2)],
    ["Performance", score(100 - performancePenalty)],
    [
      "Resilience",
      score(run.chaosInjected > 0 ? resilienceRate : 70 - failureRate),
    ],
    [
      "Observability",
      score(
        65 +
          (run.latencyTimeline?.length > 0 ? 15 : 0) +
          (run.failureTimeline?.length > 0 ? 10 : 0) +
          (run.latencyBuckets ? 10 : 0),
      ),
    ],
  ];
};

const buildRootCauses = (run) => {
  const causes = [];
  const failureRate = rate(run.failure, run.totalRequests);

  if (failureRate > 0) {
    causes.push({
      title: failureRate > 10 ? "Failure Escalation Trend" : "Backend Timeout",
      confidence: Math.min(95, 65 + Math.round(failureRate)),
      evidence: `${failureRate.toFixed(1)}% failure rate across ${run.totalRequests || 0} requests.`,
      recommendation:
        "Inspect upstream responses, retry behavior, and dependency availability.",
    });
  }

  if (numberOr(run.p95Latency) > 1000) {
    causes.push({
      title: "Worker Saturation",
      confidence: Math.min(94, 66 + Math.round(numberOr(run.p95Latency) / 120)),
      evidence: `P95 latency reached ${run.p95Latency || 0}ms.`,
      recommendation:
        "Review worker concurrency, queue depth, and slow endpoint behavior.",
    });
  }

  if (numberOr(run.packetLossInjected) > 0) {
    causes.push({
      title: "Packet Loss",
      confidence: 82,
      evidence: `${run.packetLossInjected} packet-loss fault(s) were injected.`,
      recommendation:
        "Validate retry budgets and network resilience during lossy conditions.",
    });
  }

  if (numberOr(run.timeoutInjected) > 0) {
    causes.push({
      title: "Network Instability",
      confidence: 80,
      evidence: `${run.timeoutInjected} timeout injection(s) were recorded.`,
      recommendation:
        "Tune timeout limits and verify downstream service response windows.",
    });
  }

  if (causes.length === 0) {
    causes.push({
      title: "No dominant failure source",
      confidence: 68,
      evidence: "Failure and latency signals remained within stable thresholds.",
      recommendation:
        "Use this run as a baseline for future release and chaos comparisons.",
    });
  }

  return causes;
};

const getSnapshotRows = (run) => {
  const snapshot = run.configurationSnapshot;
  const config = run.config || {};
  const chaos = run.chaosConfig || {};

  if (!snapshot && !run.config && !run.chaosConfig) {
    return null;
  }

  return [
    ["HTTP Method", snapshot?.method || config.method || "GET"],
    ["Target URL", snapshot?.targetUrl || run.url || "N/A"],
    ["Headers", JSON.stringify(snapshot?.headers || config.headers || {})],
    ["Payload Size", `${snapshot?.payloadSize ?? 0} bytes`],
    ["Concurrency", snapshot?.concurrency ?? config.rate ?? "N/A"],
    ["Duration", snapshot?.duration || config.duration || "N/A"],
    ["Workers", snapshot?.workers ?? config.workers ?? "N/A"],
    ["Kafka Enabled", snapshot?.kafkaEnabled ? "Yes" : "No"],
    ["Redis Enabled", snapshot?.redisEnabled === false ? "No" : "Yes"],
    ["Retry Count", snapshot?.retryCount ?? config.retryCount ?? 3],
    ["Timeout", `${snapshot?.timeout ?? config.timeout ?? 5000}ms`],
    ["Traffic Pattern", titleCase(snapshot?.trafficPattern || config.pattern || "requests")],
    [
      "Stages",
      Array.isArray(snapshot?.stages) && snapshot.stages.length > 0
        ? JSON.stringify(snapshot.stages)
        : Array.isArray(config.stages) && config.stages.length > 0
          ? JSON.stringify(config.stages)
          : "N/A",
    ],
    ["Chaos Enabled", (snapshot?.chaosEnabled ?? chaos.enabled) ? "Yes" : "No"],
    ["Chaos Profile", titleCase(snapshot?.chaosProfile || chaos.profile || "custom")],
    ["Failure Rate", `${snapshot?.failureRate ?? chaos.failureRate ?? 0}%`],
    ["Latency Range", snapshot?.latencyRange || "Disabled"],
    ["Packet Loss", snapshot?.packetLoss || "Disabled"],
    ["Timeout Injection", snapshot?.timeoutInjection || "Disabled"],
    ["Connection Reset", snapshot?.connectionReset || "Disabled"],
  ];
};

const getReadinessRows = (run) => {
  const readiness = run.report?.deploymentReadiness;

  if (!readiness) {
    return buildReadiness(run);
  }

  return [
    ["Availability", readiness.availability],
    ["Reliability", readiness.reliability],
    ["Performance", readiness.performance],
    ["Resilience", readiness.resilience],
    ["Observability", readiness.observability],
  ].map(([label, value]) => [label, score(value)]);
};

const getRootCauses = (run) => {
  const causes = run.report?.rootCauseAnalysis;

  if (Array.isArray(causes) && causes.length > 0) {
    return causes;
  }

  return buildRootCauses(run);
};

const getInfrastructureRows = (run) => {
  const health = run.report?.healthScore;
  const risk = run.report?.predictiveRisk;
  const memory = run.report?.infrastructureMemory;
  const comparison = run.report?.historicalComparison;

  return [
    ["Health Score", health?.score != null ? `${health.score}/100` : "N/A"],
    ["Health Status", titleCase(health?.status || "unknown")],
    ["Risk Level", titleCase(risk?.level || "stable")],
    ["Risk", risk?.risk != null ? `${risk.risk}%` : "N/A"],
    ["Memory Patterns", memory?.totalPatterns ?? 0],
    [
      "Previous Run",
      comparison?.hasPreviousRun ? comparison.previousRunId : "No baseline",
    ],
  ];
};

const getTimelineSummary = (run) => {
  const timeline = Array.isArray(run.report?.incidentTimeline)
    ? run.report.incidentTimeline
    : [];

  if (timeline.length === 0) {
    return [];
  }

  return timeline.slice(0, 4).map((incident) => ({
    title: incident.title || "Run Event",
    severity: titleCase(incident.severity || "info"),
    timestamp: formatDate(incident.timestamp),
    message: incident.message || "No details recorded.",
  }));
};

const comparisonLabel = (label) =>
  titleCase(label === "p95" ? "P95" : label);

export function ReportEnterpriseIntelligence({ run }) {
  if (!run) {
    return null;
  }

  const readiness = getReadinessRows(run);
  const rootCauses = getRootCauses(run);
  const snapshotRows = getSnapshotRows(run);
  const report = run.report || {};
  const overallHealth = score(
    report.deploymentReadiness?.overall ??
      readiness.reduce((total, [, value]) => total + value, 0) /
        readiness.length,
  );
  const aiRecommendations = Array.isArray(report.aiRecommendations)
    ? report.aiRecommendations
    : [];
  const historicalMetrics = report.historicalComparison?.metrics || {};
  const recurringIssues =
    report.historicalIntelligence?.recurringIssues || [];
  const timelineSummary = getTimelineSummary(run);

  return (
    <section className="glass rounded-[32px] p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Enterprise Intelligence
          </p>
          <h2 className="mt-3 text-2xl font-black">Deployment Readiness</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Readiness, root-cause, and infrastructure-health signals generated
            from this run&apos;s stored telemetry.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-muted-foreground">Infrastructure Health</p>
          <p className="mt-2 text-2xl font-black text-cyan-300">
            {getHealthStatus(overallHealth)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {overallHealth}/100
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {readiness.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <h3 className="mt-3 text-3xl font-black">{value}</h3>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black">Configuration Snapshot</h3>
        {snapshotRows ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {snapshotRows.map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 break-words text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-muted-foreground">
            No configuration snapshot available.
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black">AI Root Cause</h3>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {rootCauses.map((cause) => (
            <div
              key={cause.title}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <h4 className="text-lg font-black">{cause.title}</h4>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                  {cause.confidence}%
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {cause.evidence}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {cause.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black">Infrastructure Snapshot</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {getInfrastructureRows(run).map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-3 break-words text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black">Recommendations</h3>
        {aiRecommendations.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {aiRecommendations.map((recommendation) => (
              <div
                key={recommendation.title}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-lg font-black">
                    {recommendation.title}
                  </h4>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    {recommendation.confidence ?? 0}%
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {recommendation.reason}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {recommendation.expectedImpact}
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  {titleCase(recommendation.priority || "medium")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-muted-foreground">
            No AI recommendations generated for this run.
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="text-lg font-black">Historical Comparison</h3>
          {report.historicalComparison?.hasPreviousRun ? (
            <div className="mt-4 space-y-3">
              {Object.entries(historicalMetrics).map(([label, value]) => (
                <p
                  key={label}
                  className="text-sm leading-6 text-muted-foreground"
                >
                  <span className="font-semibold text-slate-200">
                    {comparisonLabel(label)}:
                  </span>{" "}
                  {value.current} vs {value.previous} ({value.trend})
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              No previous run exists for comparison.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="text-lg font-black">Historical Intelligence</h3>
          {recurringIssues.length > 0 ? (
            <div className="mt-4 space-y-4">
              {recurringIssues.slice(0, 3).map((issue) => (
                <div key={`${issue.title}-${issue.firstSeen}`}>
                  <p className="text-sm font-semibold text-slate-200">
                    {issue.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {titleCase(issue.trendDirection)} trend, first seen{" "}
                    {formatDate(issue.firstSeen)}, last seen{" "}
                    {formatDate(issue.lastSeen)}, detected{" "}
                    {issue.detectionCount} time(s). Risk{" "}
                    {issue.riskEvolution}.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              No recurring infrastructure issues recorded.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black">Timeline Summary</h3>
        {timelineSummary.length > 0 ? (
          <div className="mt-5 space-y-4">
            {timelineSummary.map((event) => (
              <div
                key={`${event.title}-${event.timestamp}`}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="text-base font-black">{event.title}</h4>
                  <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    {event.severity}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {event.timestamp}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {event.message}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-muted-foreground">
            No timeline events recorded for this run.
          </div>
        )}
      </div>
    </section>
  );
}
