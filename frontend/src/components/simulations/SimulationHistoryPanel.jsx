"use client";

import { BarChart3, CheckCircle2, Clock, Gauge, XCircle } from "lucide-react";

import { useRun } from "@/components/providers/RunProvider";
import { useSimulationRuns } from "@/hooks/useSimulationRuns";

const metricItems = [
  ["totalRequests", "Total Requests"],
  ["success", "Success"],
  ["failure", "Failures"],
  ["avgLatency", "Avg Latency", "ms"],
  ["p95Latency", "P95 Latency", "ms"],
  ["rps", "RPS"],
];

const latencyBuckets = [
  ["0-500", "0-500ms", "emerald"],
  ["500-1000", "500-1s", "cyan"],
  ["1000-2000", "1-2s", "amber"],
  ["2000+", "2s+", "red"],
];

const errorTypes = [
  ["timeout", "Timeout", "red"],
  ["network", "Network", "amber"],
  ["server", "Server", "yellow"],
];

const toneClasses = {
  emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
  amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  yellow: "border-yellow-400/20 bg-yellow-500/10 text-yellow-300",
  red: "border-red-400/20 bg-red-500/10 text-red-300",
};

const formatDate = (value) => {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleString();
};

const formatRunConfig = (config = {}) => {
  if (config.pattern === "requests") {
    const totalRequests = Number(config.totalRequests || 0);
    const rate = Number(config.rate || config.concurrency || 0);
    const duration =
      totalRequests > 0 && rate > 0
        ? `~${Math.ceil(totalRequests / rate)}s`
        : null;

    return [
      "requests",
      totalRequests > 0 ? `${totalRequests} req` : null,
      rate > 0 ? `${rate} RPS` : null,
      duration,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (Array.isArray(config.stages) && config.stages.length > 0) {
    const duration = config.stages.reduce(
      (total, stage) => total + Number(stage.durationSec || 0),
      0,
    );
    const peakRate = Math.max(
      0,
      ...config.stages.map((stage) => Number(stage.rate || 0)),
    );

    const label =
      config.stages.length === 1
        ? "duration"
        : `${config.stages.length} stages`;

    return [
      label,
      duration > 0 ? `${duration}s` : null,
      peakRate > 0 ? `${peakRate} peak RPS` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return config.pattern || "simulation";
};

const getRunConfigDetails = (config = {}) => {
  if (config.pattern === "requests") {
    const totalRequests = Number(config.totalRequests || 0);
    const rate = Number(config.rate || config.concurrency || 0);
    const duration =
      totalRequests > 0 && rate > 0
        ? `~${Math.ceil(totalRequests / rate)}s`
        : "Auto";

    return {
      label: "Request Count",
      details: [
        totalRequests > 0 ? `${totalRequests} req` : "Target req",
        rate > 0 ? `${rate} RPS` : "Rate auto",
        duration,
      ],
    };
  }

  if (Array.isArray(config.stages) && config.stages.length > 0) {
    const duration = config.stages.reduce(
      (total, stage) => total + Number(stage.durationSec || 0),
      0,
    );
    const peakRate = Math.max(
      0,
      ...config.stages.map((stage) => Number(stage.rate || 0)),
    );

    return {
      label: config.stages.length === 1 ? "Duration" : "Stages",
      details: [
        duration > 0 ? `${duration}s` : "Duration",
        peakRate > 0 ? `${peakRate} peak RPS` : "Peak rate",
        config.stages.length > 1 ? `${config.stages.length} stages` : null,
      ].filter(Boolean),
    };
  }

  return {
    label: formatRunConfig(config),
    details: [],
  };
};

export function SimulationHistoryPanel() {
  const { projectId, runs, loading, error, refresh } = useSimulationRuns({
    poll: true,
  });
  const { selectedRun, setSelectedRun } = useRun();

  const openDashboard = (run) => {
    if (!projectId || !run?.runId) {
      return;
    }

    localStorage.setItem("projectId", projectId);
    localStorage.setItem("currentRunId", run.runId);
    window.location.href = `/dashboard?${new URLSearchParams({
      projectId,
      runId: run.runId,
    }).toString()}`;
  };

  return (
    <section className="glass rounded-[28px] p-6 lg:p-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-400">
            Execution Archive
          </p>
          <h2 className="mt-4 text-3xl font-black">Simulation History</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Run statistics, latency distribution, failure breakdown, and launch
            timestamps for the selected project.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          Refresh Runs
        </button>
      </div>

      {!projectId ? (
        <div className="py-12 text-center text-muted-foreground">
          Select a project to inspect simulation history.
        </div>
      ) : loading && runs.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading simulation history...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : runs.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No simulation runs have been recorded yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {runs.map((run) => {
            const isSelected = selectedRun?.runId === run.runId;
            const configDetails = getRunConfigDetails(run.config);

            return (
              <article
                key={run.runId}
                className={`rounded-2xl border bg-black/20 p-5 transition ${
                  isSelected
                    ? "border-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.08)]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Run ID
                    </p>
                    <p className="mt-2 break-all font-mono text-sm text-slate-200">
                      {run.runId}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRun({
                          projectId,
                          runId: run.runId,
                          status: run.status || "completed",
                        })
                      }
                      className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300"
                    >
                      Select
                    </button>
                    <button
                      type="button"
                      onClick={() => openDashboard(run)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200"
                    >
                      Dashboard
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {metricItems.map(([key, label, suffix]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-2 text-lg font-bold text-slate-100">
                        {run[key] || 0}
                        {suffix || ""}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <XCircle size={16} className="text-red-300" />
                      Error Breakdown
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {errorTypes.map(([key, label, tone]) => (
                        <div
                          key={key}
                          className={`rounded-lg border p-2 text-xs ${toneClasses[tone]}`}
                        >
                          <p>{label}</p>
                          <p className="mt-1 text-base font-bold">
                            {run.errorTypes?.[key] || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <BarChart3 size={16} className="text-cyan-300" />
                      Latency Buckets
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {latencyBuckets.map(([key, label, tone]) => (
                        <div
                          key={key}
                          className={`rounded-lg border p-2 text-xs ${toneClasses[tone]}`}
                        >
                          <p>{label}</p>
                          <p className="mt-1 text-base font-bold">
                            {run.latencyBuckets?.[key] || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 text-sm text-muted-foreground sm:grid-cols-3">
                  <span className="inline-flex items-center gap-2">
                    <Clock size={15} />
                    {formatDate(run.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 size={15} />
                    {run.status || "completed"}
                  </span>
                  <span className="flex min-w-0 items-start gap-2">
                    <Gauge size={15} className="mt-0.5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-semibold text-slate-200">
                        {configDetails.label}
                      </span>
                      {configDetails.details.length > 0 && (
                        <span className="mt-1 flex flex-wrap gap-1.5">
                          {configDetails.details.map((detail) => (
                            <span
                              key={detail}
                              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-slate-400"
                            >
                              {detail}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
