
import { InfrastructureAlerts } from "@/components/infrastructure/InfrastructureAlerts";
import { InfrastructureEventFeed } from "@/components/infrastructure/InfrastructureEventFeed";
import { InfrastructureHealthGrid } from "@/components/infrastructure/InfrastructureHealthGrid";
import { InfrastructureOverview } from "@/components/infrastructure/InfrastructureOverview";
import { InfrastructureStatusCards } from "@/components/infrastructure/InfrastructureStatusCards";
import { InfrastructureTopology } from "@/components/infrastructure/InfrastructureTopology";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Page() {
  return (
    <ProtectedRoute>
      <AppShell>
        <PageHeader
          eyebrow="Infrastructure intelligence"
          title="Distributed Infrastructure Map"
          description="
            Monitor Kafka workers, Redis systems,
            websocket infrastructure, and distributed
            platform health across ChaosForge.
          "
        />

          <InfrastructureOverview />

          <InfrastructureStatusCards  />

          <InfrastructureHealthGrid />

          <InfrastructureTopology />

          <InfrastructureAlerts />

          <InfrastructureEventFeed />
      </AppShell>
    </ProtectedRoute>
  );
}
