import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { SettingsContent } from "@/components/settings/SettingsContent";
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
        <SettingsContent />
      </AppShell>
    </ProtectedRoute>
  );
}
