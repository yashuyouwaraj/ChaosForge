import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Page() {
  return (
    <ProtectedRoute>
    <AppShell>
      <PageHeader
        eyebrow="Platform configuration"
        title="
    Workspace Settings
  "
        description="
    Configure notifications, platform preferences,
    operational settings, and infrastructure workspace controls.
  "
      />
      <div className="text-3xl font-bold">Coming Soon</div>
    </AppShell>
    </ProtectedRoute>
  );
}
