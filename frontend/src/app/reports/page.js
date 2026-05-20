import { AppShell } from "@/components/layout/AppShell";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { PageHeader } from "@/components/shared/PageHeader";

import { ReportsTable } from "@/components/reports/ReportsTable";

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-10">
          <PageHeader
            eyebrow="Operational intelligence"
            title="Infrastructure Reports"
            description="
              Historical infrastructure analytics,
              simulation summaries, AI operational
              insights, and distributed performance
              reporting across ChaosForge workloads.
            "
          />

          <ReportsTable />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}