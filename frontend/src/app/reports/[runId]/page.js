import { AppShell } from "@/components/layout/AppShell";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { PageHeader } from "@/components/shared/PageHeader";

import { ReportOverview } from "@/components/reports/ReportOverview";

import { RunOperationalSummary } from "@/components/reports/RunOperationalSummary";

import { FailureBreakdown } from "@/components/reports/FailureBreakdown";

import { LatencyDistribution } from "@/components/reports/LatencyDistribution";

import { IncidentReportTimeline } from "@/components/reports/IncidentReportTimeline";

export default function ReportDetailPage({ params }) {
  const { runId } = params;

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

          <ReportOverview runId={runId} />

          <RunOperationalSummary runId={runId} />

          <FailureBreakdown runId={runId} />

          <LatencyDistribution runId={runId} />

          <IncidentReportTimeline runId={selectedRun.runId} />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
