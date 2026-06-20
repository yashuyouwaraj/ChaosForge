import { ChaosContent } from "@/components/chaos/ChaosContent";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function ChaosPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <ChaosContent />
      </AppShell>
    </ProtectedRoute>
  );
}
