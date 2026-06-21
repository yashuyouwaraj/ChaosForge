"use client";

import { useMemo } from "react";

import { AnomalyCenter } from "@/components/ai/AnomalyCenter";
import { ExecutiveBriefCenter } from "@/components/ai/ExecutiveBriefCenter";
import { ExecutiveSummaryCenter } from "@/components/ai/ExecutiveSummaryCenter";
import { HealthScoreCenter } from "@/components/ai/HealthScoreCenter";
import { IncidentCorrelationGraph } from "@/components/ai/IncidentCorrelationGraph";
import { IncidentReplayCenter } from "@/components/ai/IncidentReplayCenter";
import { InfrastructureMemoryCenter } from "@/components/ai/InfrastructureMemoryCenter";
import { OperationalInsightCenter } from "@/components/ai/OperationalInsightCenter";
import { PredictiveRiskPanel } from "@/components/ai/PredictiveRiskPanel";
import { RemediationCenter } from "@/components/ai/RemediationCenter";
import { RootCauseCenter } from "@/components/ai/RootCauseCenter";
import { RunbookCenter } from "@/components/ai/RunbookCenter";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useProject } from "@/components/providers/ProjectProvider";
import { useRun } from "@/components/providers/RunProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSimulationRuns } from "@/hooks/useSimulationRuns";
import { AiOperationsOverview } from "@/components/ai/AiOperationsOverview";
import { AiExplainButton } from "@/components/copilot/AiExplainPanel";

const formatDate = (value) => {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleString();
};

export default function Page() {
  const { projectId } = useProject() || {};
  const { selectedRun, setSelectedRun } = useRun() || {};
  const { runs, loading, error, refresh } = useSimulationRuns({ poll: true });

  const sortedRuns = useMemo(
    () =>
      [...runs].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      ),
    [runs],
  );

  const activeProjectId = selectedRun?.projectId || projectId;
  const activeRunId = selectedRun?.runId;
  const activeRun = sortedRuns.find((run) => run.runId === activeRunId) || null;
  const canRenderAi = Boolean(activeProjectId && activeRunId);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-10">
          <PageHeader
            eyebrow="AI infrastructure intelligence"
            title="AI Operations Center"
            description="
              Analyze infrastructure anomalies,
              operational incidents, telemetry trends,
              and realtime AI-powered infrastructure insights.
            "
          />

          <section className="glass rounded-[32px] p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                  Run Context
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Select Run For AI Analysis
                </h2>

                <p className="mt-3 max-w-3xl text-muted-foreground">
                  Choose a recorded simulation run and the AI Operations Center
                  will load predictive intelligence, root cause analysis,
                  remediation, runbook, and memory signals for that run.
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
              <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-yellow-200">
                Select a project first to load simulation runs.
              </div>
            ) : error ? (
              <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-200">
                {error}
              </div>
            ) : loading && sortedRuns.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-slate-300">
                Loading simulation runs...
              </div>
            ) : sortedRuns.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-slate-300">
                No simulation runs are available for this project yet.
              </div>
            ) : (
              <div className="mt-8 grid gap-5 lg:grid-cols-[1fr,0.7fr]">
                <select
                  value={activeRunId || ""}
                  onChange={(event) => {
                    const run = sortedRuns.find(
                      (item) => item.runId === event.target.value,
                    );

                    if (!run) {
                      return;
                    }

                    setSelectedRun({
                      projectId,
                      runId: run.runId,
                      status: run.status || "completed",
                    });
                  }}
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-mono text-sm text-slate-100 outline-none"
                >
                  <option value="">Select a run</option>

                  {sortedRuns.map((run) => (
                    <option key={run.runId} value={run.runId}>
                      {run.runId} / {run.status || "completed"}
                    </option>
                  ))}
                </select>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Selected Run
                  </p>

                  <p className="mt-3 break-all font-mono text-sm text-slate-200">
                    {activeRunId || "No run selected"}
                  </p>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {activeRun
                      ? `${activeRun.status || "completed"} / ${formatDate(
                          activeRun.createdAt,
                        )}`
                      : "Choose a run to unlock AI intelligence."}
                  </p>
                </div>
              </div>
            )}
          </section>

          {canRenderAi ? (
            <>
              <div className="flex flex-wrap gap-3">
                <AiExplainButton
                  label="✨ Explain Run"
                  title="Explain Run"
                  skill="explainRun"
                  payload={{
                    projectId: activeProjectId,
                    runId: activeRunId,
                  }}
                />
                <AiExplainButton
                  label="Executive Brief"
                  title="Executive Brief"
                  skill="executiveBrief"
                  payload={{
                    projectId: activeProjectId,
                    runId: activeRunId,
                  }}
                />
                <AiExplainButton
                  label="Optimization Advisor"
                  title="Optimization Advisor"
                  skill="optimizationAdvisor"
                  payload={{
                    projectId: activeProjectId,
                    runId: activeRunId,
                  }}
                />
                <AiExplainButton
                  label="Weekly Review"
                  title="Weekly Infrastructure Review"
                  skill="weeklyInfrastructureReview"
                  payload={{ projectId: activeProjectId }}
                />
                <AiExplainButton
                  label="AI Runbook"
                  title="Runbook Generator"
                  skill="runbook"
                  payload={{
                    projectId: activeProjectId,
                    runId: activeRunId,
                  }}
                />
                <AiExplainButton
                  label="Capacity Planner"
                  title="Capacity Planner"
                  skill="capacityPlanner"
                  payload={{
                    projectId: activeProjectId,
                    runId: activeRunId,
                  }}
                />
              </div>

              <AiOperationsOverview projectId={activeProjectId} runId={activeRunId} />

              <ExecutiveBriefCenter
                projectId={activeProjectId}
                runId={activeRunId}
                run={activeRun}
              />

              <ExecutiveSummaryCenter
                projectId={activeProjectId}
                runId={activeRunId}
              />

              <HealthScoreCenter
                projectId={activeProjectId}
                runId={activeRunId}
              />

              <PredictiveRiskPanel
                projectId={activeProjectId}
                runId={activeRunId}
              />

              <AnomalyCenter projectId={activeProjectId} runId={activeRunId} />

              <RootCauseCenter
                projectId={activeProjectId}
                runId={activeRunId}
              />

              <OperationalInsightCenter
                projectId={activeProjectId}
                runId={activeRunId}
              />

              <RemediationCenter
                projectId={activeProjectId}
                runId={activeRunId}
              />

              <RunbookCenter projectId={activeProjectId} runId={activeRunId} />

              <IncidentCorrelationGraph
                projectId={activeProjectId}
                runId={activeRunId}
              />

              <IncidentReplayCenter />

              <InfrastructureMemoryCenter projectId={activeProjectId} />
            </>
          ) : (
            <div className="glass rounded-[32px] p-10 text-center text-slate-300">
              Select a run above to view AI operations intelligence.
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
