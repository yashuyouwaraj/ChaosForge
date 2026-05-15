import { AppShell } from "@/components/layout/AppShell";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { GrafanaPanel } from "@/components/dashboard/GrafanaPanel";
import { PrometheusPanel } from "@/components/dashboard/PrometheusPanel";
import { PageHeader } from "@/components/shared/PageHeader";

export default function ObservabilityPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-10">
          <PageHeader
            eyebrow="Realtime telemetry"
            title="
    Observability Workspace
  "
            description="
    Unified infrastructure telemetry powered by
    Prometheus, Grafana, realtime metrics,
    and distributed monitoring systems.
  "
          />

          <GrafanaPanel title="ChaosForge Metrics" path="/d" />

          <PrometheusPanel />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
