import { AppShell } from "@/components/layout/AppShell";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { PageHeader } from "@/components/shared/PageHeader";

import { ReportDetailContent } from "@/components/reports/ReportDetailContent";

export default async function ReportDetailPage({ params, searchParams }) {
  const { runId } = await params;
  const { projectId } = (await searchParams) || {};

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-10">
          <PageHeader
            eyebrow="Infrastructure analysis"
            title="Operational Report"
            description="
              Historical infrastructure
              analytics, operational
              anomalies, AI-generated
              insights, and distributed
              simulation intelligence.
            "
          />

          <ReportDetailContent projectId={projectId} runId={runId} />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
