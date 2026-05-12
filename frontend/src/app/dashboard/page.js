import { AppShell } from "@/components/layout/AppShell";

import { DashboardSection } from "@/components/dashboard/DashboardSection";

import { CreateSimulationPanel } from "@/components/dashboard/CreateSimulationPanel";

import { InfrastructureAlerts } from "@/components/dashboard/InfrastructureAlerts";

import { IncidentTimeline } from "@/components/dashboard/IncidentTimeline";

import { RunSelector } from "@/components/dashboard/RunSelector";

import { InfrastructureHealthGrid } from "@/components/dashboard/InfrastructureHealthGrid";
import { InfrastructureStatusCards } from "@/components/dashboard/InfrastructureStatusCards";

import { AiInsightsPreview } from "@/components/dashboard/AiInsightsPreview";

import { RealtimeTelemetry } from "@/components/dashboard/RealtimeTelemetry";

import { RealtimeCharts } from "@/components/dashboard/RealtimeCharts";

import { ActiveSimulations } from "@/components/dashboard/ActiveSimulations";

import { LiveLogStream } from "@/components/dashboard/LiveLogStream";

import { AlertCenter } from "@/components/dashboard/AlertCenter";

import { InfrastructureTopology } from "@/components/dashboard/InfrastructureTopology";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-10">
        {/* HERO */}
        <section
          className="
            glass rounded-[32px]
            p-10
          "
        >
          <p
            className="
              text-sm uppercase tracking-[0.3em]
              text-cyan-400
            "
          >
            AI-native observability
          </p>

          <h1
            className="
              mt-4 max-w-4xl
              text-5xl font-black
              leading-tight
            "
          >
            Distributed Infrastructure Intelligence Platform
          </h1>

          <p
            className="
              mt-6 max-w-2xl
              text-lg text-muted-foreground
            "
          >
            Realtime distributed load testing, observability, AI insights, and
            infrastructure intelligence.
          </p>
        </section>

        <DashboardSection
          title="Infrastructure Grid"
          description="Realtime operational infrastructure state."
        >
          <InfrastructureHealthGrid />
        </DashboardSection>

        <RunSelector />

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
          title="Realtime Observability"
          description="Streaming infrastructure analytics and telemetry."
        >
          <RealtimeCharts />
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
          title="Incident Intelligence"
          description="Realtime infrastructure anomalies and operational alerts."
        >
          <AlertCenter />
        </DashboardSection>

        <DashboardSection
          title="Infrastructure Topology"
          description="Realtime distributed system architecture visualization."
        >
          <InfrastructureTopology />
        </DashboardSection>

        <InfrastructureAlerts />

        <IncidentTimeline />

        {/* AI */}
        <DashboardSection
          title="AI Insights"
          description="Realtime infrastructure intelligence."
        >
          <AiInsightsPreview />
        </DashboardSection>
      </div>
    </AppShell>
  );
}
