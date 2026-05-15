import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Page() {
  return (
    <ProtectedRoute>
      <AppShell>
        <PageHeader
          eyebrow="Operational identity"
          title="
    Platform Profile
  "
          description="
    Manage your ChaosForge workspace identity,
    operational access, and infrastructure platform account settings.
  "
        />
        <div className="text-3xl font-bold">Coming Soon</div>
      </AppShell>
    </ProtectedRoute>
  );
}
