"use client";

import { useMemo, useState } from "react";
import { GitCompareArrows, Lightbulb, TrendingDown, TrendingUp } from "lucide-react";

import { useSimulationRuns } from "@/hooks/useSimulationRuns";
import { api } from "@/lib/api";

const comparisonMetrics = [
  ["success", "Success Rate", true],
  ["rps", "RPS", true],
  ["avgLatency", "Avg Latency", false],
  ["p95Latency", "P95 Latency", false],
  ["failureRate", "Failure Rate", false],
];

const trendLabel = (trend) => {
  if (trend === "improvement") {
    return "Better";
  }

  if (trend === "degraded") {
    return "Worse";
  }

  return "Same";
};

const trendClasses = (trend) => {
  if (trend === "improvement") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  if (trend === "degraded") {
    return "border-red-400/20 bg-red-500/10 text-red-300";
  }

  return "border-white/10 bg-white/5 text-slate-300";
};

const deltaClasses = (delta, higherIsBetter) => {
  if (Number(delta || 0) === 0) {
    return "text-slate-200";
  }

  const improved = higherIsBetter ? delta > 0 : delta < 0;
  return improved ? "text-emerald-300" : "text-red-300";
};

export function RunComparisonPanel() {
  const { projectId, runs, loading } = useSimulationRuns({ poll: true });
  const [selectedRuns, setSelectedRuns] = useState({ runA: "", runB: "" });
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState("");
  const [comparing, setComparing] = useState(false);

  const sortedRuns = useMemo(
    () =>
      [...runs].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      ),
    [runs],
  );

  const compareRuns = async () => {
    if (!selectedRuns.runA || !selectedRuns.runB) {
      setError("Select two runs to compare.");
      return;
    }

    if (selectedRuns.runA === selectedRuns.runB) {
      setError("Select two different runs.");
      return;
    }

    try {
      setError("");
      setComparing(true);
      const data = await api(
        `/runs/compare?runA=${selectedRuns.runA}&runB=${selectedRuns.runB}`,
      );
      setComparison(data);
    } catch (err) {
      setComparison(null);
      setError(err.message || "Failed to compare runs.");
    } finally {
      setComparing(false);
    }
  };

  return (
    <section className="glass rounded-[28px] p-6 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.4fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-400">
            Regression Intelligence
          </p>
          <h2 className="mt-4 text-3xl font-black">Run Comparison</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Compare two historical runs using the existing ChaosForge comparison
            API, preserving deltas, trends, and generated insights.
          </p>

          <div className="mt-6 space-y-3">
            <select
              value={selectedRuns.runA}
              onChange={(event) =>
                setSelectedRuns((prev) => ({
                  ...prev,
                  runA: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            >
              <option value="">Select baseline run</option>
              {sortedRuns.map((run) => (
                <option key={run.runId} value={run.runId}>
                  {run.runId.slice(0, 8)}... ({run.rps || 0} RPS)
                </option>
              ))}
            </select>

            <select
              value={selectedRuns.runB}
              onChange={(event) =>
                setSelectedRuns((prev) => ({
                  ...prev,
                  runB: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            >
              <option value="">Select comparison run</option>
              {sortedRuns.map((run) => (
                <option key={run.runId} value={run.runId}>
                  {run.runId.slice(0, 8)}... ({run.rps || 0} RPS)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={compareRuns}
              disabled={!projectId || loading || comparing || runs.length < 2}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black transition hover:scale-[1.01] disabled:opacity-50"
            >
              <GitCompareArrows size={16} />
              {comparing ? "Comparing" : "Compare Runs"}
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          {!projectId ? (
            <div className="py-16 text-center text-muted-foreground">
              Select a project to compare runs.
            </div>
          ) : runs.length < 2 ? (
            <div className="py-16 text-center text-muted-foreground">
              At least two runs are required for comparison.
            </div>
          ) : !comparison ? (
            <div className="py-16 text-center text-muted-foreground">
              Choose a baseline and comparison run to inspect performance drift.
            </div>
          ) : (
            <div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {comparisonMetrics.map(([key, label, higherIsBetter]) => {
                  const delta = Number(comparison?.deltas?.[key] || 0);
                  const trend = comparison?.trends?.[key];

                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-400">{label}</p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${trendClasses(
                            trend,
                          )}`}
                        >
                          {trend === "degraded" ? (
                            <TrendingDown size={13} />
                          ) : (
                            <TrendingUp size={13} />
                          )}
                          {trendLabel(trend)}
                        </span>
                      </div>

                      <p
                        className={`mt-4 text-3xl font-black ${deltaClasses(
                          delta,
                          higherIsBetter,
                        )}`}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta}%
                      </p>
                    </div>
                  );
                })}
              </div>

              {comparison?.insights?.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                    <Lightbulb size={16} />
                    Insights
                  </div>

                  <ul className="mt-3 space-y-2">
                    {comparison.insights.map((insight, index) => (
                      <li
                        key={`${insight}-${index}`}
                        className="text-sm leading-6 text-slate-200"
                      >
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
