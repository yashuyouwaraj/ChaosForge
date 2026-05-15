import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Page() {
  return (
    <ProtectedRoute>
    <AppShell>
      <PageHeader
        eyebrow="Platform usage"
        title="
    Billing & Platform Usage
  "
        description="
    Monitor infrastructure consumption,
    subscriptions, usage metrics,
    and ChaosForge platform plans.
  "
      />
      <div className="text-3xl font-bold">Coming Soon</div>
    </AppShell>
    </ProtectedRoute>
  );
}
