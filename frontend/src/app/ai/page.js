import { AiInsightsCenter } from "@/components/ai/AiInsightsCenter";
import { AiOverviewCard } from "@/components/ai/AiOverviewCard";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AnomalyCenter } from "@/components/reports/AnomalyCenter";
import { ExecutiveSummaryCenter } from "@/components/reports/ExecutiveSummaryCenter";
import { InfrastructureMemoryCenter } from "@/components/reports/InfrastructureMemoryCenter";
import { OperationalInsightCenter } from "@/components/reports/OperationalInsightCenter";
import { PredictiveRiskPanel } from "@/components/reports/PredictiveRiskPanel";
import { RemediationCenter } from "@/components/reports/RemediationCenter";
import { RootCauseCenter } from "@/components/reports/RootCauseCenter";
import { RunbookCenter } from "@/components/reports/RunbookCenter";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Page() {
  return (
    <ProtectedRoute>
      <AppShell>
        <PageHeader
          eyebrow="AI infrastructure intelligence"
          title="AI Operations Center"
          description="
            Analyze infrastructure anomalies,
            operational incidents, telemetry trends,
            and realtime AI-powered infrastructure insights.
          "
        />
        <AiOverviewCard />

        <AiInsightsCenter />
      </AppShell>
    </ProtectedRoute>
  );
}
