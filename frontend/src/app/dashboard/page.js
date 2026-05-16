"use client";

import { AppShell } from "@/components/layout/AppShell";

import { DashboardSection } from "@/components/dashboard/DashboardSection";


import { PageHeader } from "@/components/shared/PageHeader";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { CreateSimulationPanel } from "@/components/dashboard/CreateSimulationPanel";

import { InfrastructureAlerts } from "@/components/dashboard/InfrastructureAlerts";

import { RunAiInsights } from "@/components/dashboard/RunAiInsights";

import { IncidentTimeline } from "@/components/dashboard/IncidentTimeline";

import { RunSelector } from "@/components/dashboard/RunSelector";

import { InfrastructureHealthGrid } from "@/components/dashboard/InfrastructureHealthGrid";
import { InfrastructureStatusCards } from "@/components/dashboard/InfrastructureStatusCards";

import { RealtimeTelemetry } from "@/components/dashboard/RealtimeTelemetry";

import { LatencyBuckets } from "@/components/dashboard/LatencyBuckets";

import { RealtimeCharts } from "@/components/dashboard/RealtimeCharts";

import { ActiveSimulations } from "@/components/dashboard/ActiveSimulations";

import { LiveLogStream } from "@/components/dashboard/LiveLogStream";

import { InfrastructureTopology } from "@/components/dashboard/InfrastructureTopology";
import { usePlatformOverview } from "@/hooks/usePlatformOverview";

export default function DashboardPage() {
  const overview = usePlatformOverview();
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-10">
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
              className="
      grid gap-4
      md:grid-cols-2
      xl:grid-cols-4
    "
            >
              {/* PROJECTS */}

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
                  Projects
                </p>

                <h3
                  className="
          mt-3 text-3xl
          font-black
        "
                >
                  {overview.totalProjects}
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
            </div>
          </PageHeader>

          <DashboardSection
            title="Infrastructure Grid"
            description="Realtime operational infrastructure state."
          >
            <InfrastructureHealthGrid />
          </DashboardSection>

          <DashboardSection>
            <RunSelector />
          </DashboardSection>

          <CreateSimulationPanel />

          {/* INFRA */}
          <DashboardSection
            title="Infrastructure Health"
            description="Realtime distributed system status."
          >
            <InfrastructureStatusCards />
          </DashboardSection>

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
            title="AI Insights"
            description="Realtime infrastructure intelligence."
          >
            <RunAiInsights />
          </DashboardSection>

          <DashboardSection
            title="Simulation Command Center"
            description="Realtime distributed load orchestration."
          >
            <ActiveSimulations />
          </DashboardSection>

          <DashboardSection
            title="Realtime Infrastructure Feed"
            description="Live distributed infrastructure events and operational activity."
          >
            <LiveLogStream />
          </DashboardSection>

          <DashboardSection
            title="Infrastructure Topology"
            description="Realtime distributed system architecture visualization."
          >
            <InfrastructureTopology />
          </DashboardSection>

          <DashboardSection>
            <InfrastructureAlerts />
          </DashboardSection>

          <DashboardSection>
            <IncidentTimeline />
          </DashboardSection>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
