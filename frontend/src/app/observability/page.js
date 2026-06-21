import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ObservabilityWorkspace } from "@/components/observability/ObservabilityWorkspace";

export default function ObservabilityPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <ObservabilityWorkspace />
      </AppShell>
    </ProtectedRoute>
  );
}
