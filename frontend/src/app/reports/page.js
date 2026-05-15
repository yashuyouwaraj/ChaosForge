import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Page() {
  return (
    <ProtectedRoute>
    <AppShell>
      <PageHeader
        eyebrow="Infrastructure analytics"
        title="
    Operational Reports Center
  "
        description="
    Export infrastructure telemetry,
    operational metrics, simulation analytics,
    and distributed system performance reports.
  "
      />
      <div className="text-3xl font-bold">Coming Soon</div>
    </AppShell>
    </ProtectedRoute>
  );
}
