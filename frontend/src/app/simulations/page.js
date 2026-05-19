import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { PageHeader } from "@/components/shared/PageHeader";

import { CreateSimulationPanel } from "@/components/simulations/CreateSimulationPanel";
import { ActiveSimulations } from "@/components/simulations/ActiveSimulations";
import { SimulationControlCenter } from "@/components/simulations/SimulationControlCenter";
import { SimulationHistoryPanel } from "@/components/simulations/SimulationHistoryPanel";
import { SimulationSummaryCards } from "@/components/simulations/SimulationSummaryCards";
import { RunComparisonPanel } from "@/components/simulations/RunComparisonPanel";

export default function SimulationsPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-10">
          <PageHeader
            eyebrow="Distributed load execution"
            title="Traffic Simulation Workspace"
            description="Launch realtime distributed traffic simulations, manage active runs, and orchestrate infrastructure load testing workflows."
          />

          <SimulationSummaryCards />

          <CreateSimulationPanel />

          <SimulationControlCenter />

          <ActiveSimulations />

          <SimulationHistoryPanel />

          <RunComparisonPanel />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
