import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Page() {
  return (
    <ProtectedRoute>
    <AppShell>
      <PageHeader
        eyebrow="AI infrastructure intelligence"
        title="
    AI Operations Center
  "
        description="
    Analyze infrastructure anomalies,
    operational incidents, telemetry trends,
    and realtime AI-powered infrastructure insights.
  "
      />
      <div className="text-3xl font-bold">Coming Soon</div>
    </AppShell>
    </ProtectedRoute>
  );
}
