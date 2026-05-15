import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import {
  PageHeader,
} from "@/components/shared/PageHeader";

export default function Page() {
  return (
    <ProtectedRoute>
    <AppShell>
      <PageHeader
        eyebrow="Infrastructure intelligence"
        title="
    Distributed Infrastructure Map
  "
        description="
    Monitor Kafka workers, Redis systems,
    websocket infrastructure, and distributed
    platform health across ChaosForge.
  "
      />

      <div className="text-3xl font-bold">Coming Soon</div>
    </AppShell>
    </ProtectedRoute>
  );
}
