import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Page() {
  return (
    <ProtectedRoute>
    <AppShell>
      <PageHeader
        eyebrow="Distributed load execution"
        title="
    Traffic Simulation Workspace
  "
        description="
    Launch realtime distributed traffic simulations,
    manage active runs, and orchestrate
    infrastructure load testing workflows.
  "
      />
      <div className="text-3xl font-bold">Coming Soon</div>
    </AppShell>
    </ProtectedRoute>
  );
}
