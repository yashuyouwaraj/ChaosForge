"use client";

import { useEffect, useState } from "react";
import { Loader2, Power } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { ChaosDashboardWidget } from "@/components/dashboard/ChaosDashboardWidget";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { RunAiInsights } from "@/components/dashboard/RunAiInsights";

import { IncidentTimeline } from "@/components/dashboard/IncidentTimeline";

import { RunSelector } from "@/components/dashboard/RunSelector";

import { RealtimeTelemetry } from "@/components/dashboard/RealtimeTelemetry";

import { LatencyBuckets } from "@/components/dashboard/LatencyBuckets";

import { RealtimeCharts } from "@/components/dashboard/RealtimeCharts";

import { LiveLogStream } from "@/components/dashboard/LiveLogStream";
import { DashboardCopilotActions } from "@/components/dashboard/DashboardCopilotActions";
import { AiDashboardPanel } from "@/components/copilot/AiDashboardPanel";
import { ChaosAdvisorPanel } from "@/components/copilot/ChaosAdvisorPanel";

import { usePlatform } from "@/components/providers/PlatformProvider";
import { usePlatformOverview } from "@/hooks/usePlatformOverview";
import { useProject } from "@/components/providers/ProjectProvider";
import { useRun } from "@/components/providers/RunProvider";
import { api } from "@/lib/api";
import { wakeGrafana, wakePrometheus } from "@/lib/observability";

const WORKER_WAKE_TIMEOUT_MS = 12000;

const getWorkerWakeUrls = () =>
  (process.env.NEXT_PUBLIC_WORKER_WAKE_URLS || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

const wakeWorkerUrl = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, WORKER_WAKE_TIMEOUT_MS);

  try {
    await fetch(url, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const wakeWorkerUrls = async () => {
  const workerWakeUrls = getWorkerWakeUrls();

  await Promise.allSettled(workerWakeUrls.map(wakeWorkerUrl));

  return workerWakeUrls.length;
};

export default function DashboardPage() {
  const overview = usePlatformOverview();
  const { projectId } = useProject() || {};
  const { selectedRun } = useRun() || {};
  const { infrastructure } = usePlatform();
  const { infrastructureSummary, loading: infrastructureLoading } =
    infrastructure || {};
  const [wakeStatus, setWakeStatus] = useState("");
  const [isWakingWorkers, setIsWakingWorkers] = useState(false);

  useEffect(() => {
    wakeGrafana();
    wakePrometheus();
    api("/health/wake", "POST").catch(() => {});
    wakeWorkerUrls().catch(() => {});
  }, []);

  const handleWakeWorkers = async () => {
    setIsWakingWorkers(true);
    setWakeStatus("");

    try {
      const workerCount = await wakeWorkerUrls();

      setWakeStatus(
        workerCount > 0
          ? `Worker wake GET sent to ${workerCount} worker${workerCount === 1 ? "" : "s"}`
          : "No worker wake URLs configured in the frontend",
      );
    } catch (err) {
      setWakeStatus(err.message || "Worker wake request failed");
    } finally {
      setIsWakingWorkers(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6 lg:space-y-10">
          {/* HERO */}
          <PageHeader
            eyebrow="AI-native observability"
            title="
    Distributed Infrastructure
    Intelligence Platform
  "
            description="
    Realtime distributed load testing,
    observability, AI insights,
    and infrastructure intelligence.
  "
          >
            <div
              className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-5
    "
            >
              {/* SELECTED PROJECT */}

              <div
                className="
        rounded-2xl
        border border-white/10
        bg-black/20
        p-5
      "
              >
                <p
                  className="
          text-xs uppercase
          tracking-[0.2em]
          text-slate-500
        "
                >
                  Selected Project
                </p>

                <h3
                  className="
          mt-3 truncate text-2xl
          font-black
        "
                  title={overview.selectedProjectName || "No project selected"}
                >
                  {overview.selectedProjectName || "No project selected"}
                </h3>
              </div>

              {/* TOTAL RUNS */}

              <div
                className="
        rounded-2xl
        border border-cyan-400/20
        bg-cyan-400/[0.04]
        p-5
      "
              >
                <p
                  className="
          text-xs uppercase
          tracking-[0.2em]
          text-slate-500
        "
                >
                  Total Runs
                </p>

                <h3
                  className="
          mt-3 text-3xl
          font-black text-cyan-300
        "
                >
                  {overview.totalRuns}
                </h3>
              </div>

              {/* COMPLETED RUNS */}

              <div
                className="
        rounded-2xl
        border border-white/10
        bg-black/20
        p-5
      "
              >
                <p
                  className="
          text-xs uppercase
          tracking-[0.2em]
          text-slate-500
        "
                >
                  Completed Runs
                </p>

                <h3
                  className={`
          mt-3 text-3xl
          font-black

          text-green-400
        `}
                >
                  {overview.completedRuns}
                </h3>
              </div>

              {/* FAILED RUNS */}

              <div
                className="
        rounded-2xl
        border border-red-400/20
        bg-red-400/[0.04]
        p-5
      "
              >
                <p
                  className="
          text-xs uppercase
          tracking-[0.2em]
          text-slate-500
        "
                >
                  Failed Runs
                </p>

                <h3
                  className="
          mt-3 text-3xl
          font-black text-red-400
        "
                >
                  {overview.failedRuns}
                </h3>
              </div>

              {/* Active RUNS */}

              <div
                className="
        rounded-2xl
        border border-red-400/20
        bg-red-400/[0.04]
        p-5
      "
              >
                <p
                  className="
          text-xs uppercase
          tracking-[0.2em]
          text-slate-500
        "
                >
                  Active Runs
                </p>

                <h3
                  className="
          mt-3 text-3xl
          font-black text-red-400
        "
                >
                  {infrastructureLoading
                    ? "..."
                    : (infrastructureSummary?.activeRuns ?? 0)}
                </h3>
              </div>
            </div>
          </PageHeader>


          <DashboardSection>
            <RunSelector />
          </DashboardSection>

          <div className="flex justify-end">
            <DashboardCopilotActions />
          </div>

          <DashboardSection
            title="Chaos Engineering"
            description="Current fault-injection posture for the selected project."
          >
            <ChaosDashboardWidget />
          </DashboardSection>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleWakeWorkers}
              disabled={isWakingWorkers}
              className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
            >
              {isWakingWorkers ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Power />
              )}
              {isWakingWorkers ? "Waking Workers" : "Wake Workers"}
            </Button>

            {wakeStatus && (
              <p className="text-sm text-muted-foreground">{wakeStatus}</p>
            )}
          </div>

          {/* <CreateSimulationPanel /> */}

          <DashboardSection
            title="Realtime Telemetry"
            description="Live infrastructure metrics streaming."
          >
            <RealtimeTelemetry />
          </DashboardSection>

          <DashboardSection
            title="Latency Distribution"
            description="Realtime response-time bucket analysis."
          >
            <LatencyBuckets />
          </DashboardSection>

          <DashboardSection
            title="Realtime Observability"
            description="Streaming infrastructure analytics and telemetry."
          >
            <RealtimeCharts />
          </DashboardSection>

          {/* AI */}
          <DashboardSection
            title="AI Platform Intelligence"
            description="Intelligence Engine metrics with NVIDIA Copilot platform status."
          >
            <AiDashboardPanel
              projectId={projectId}
              runId={selectedRun?.runId}
            />
          </DashboardSection>

          <DashboardSection
            title="Operational Intelligence"
            description="Realtime infrastructure intelligence."
          >
            <RunAiInsights />
          </DashboardSection>

          <DashboardSection
            title="Chaos Advisor"
            description="AI-generated chaos experiment profiles with apply-to-project support."
          >
            <ChaosAdvisorPanel />
          </DashboardSection>

          {/* <DashboardSection
            title="Simulation Command Center"
            description="Realtime distributed load orchestration."
          >
            <ActiveSimulations />
          </DashboardSection> */}

          <DashboardSection
            title="Realtime Infrastructure Feed"
            description="Live distributed infrastructure events and operational activity."
          >
            <LiveLogStream />
          </DashboardSection>

          <DashboardSection>
            <IncidentTimeline />
          </DashboardSection>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
