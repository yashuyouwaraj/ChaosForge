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

import { RealtimeCharts } from "@/components/dashboard/RealtimeCharts";

import { ActiveSimulations } from "@/components/dashboard/ActiveSimulations";

import { LiveLogStream } from "@/components/dashboard/LiveLogStream";

import { InfrastructureTopology } from "@/components/dashboard/InfrastructureTopology";

export default function DashboardPage() {
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
          />

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
