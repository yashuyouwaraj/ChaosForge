import {
  AppShell,
} from "@/components/layout/AppShell";

import {
  GrafanaPanel,
} from "@/components/dashboard/GrafanaPanel";

export default function ObservabilityPage() {
  return (
    <AppShell>
      <div className="space-y-10">
        <section>
          <p
            className="
              text-sm uppercase
              tracking-[0.3em]
              text-cyan-400
            "
          >
            ChaosForge Observability
          </p>

          <h1
            className="
              mt-4 text-5xl
              font-black
            "
          >
            Infrastructure Intelligence
          </h1>

          <p
            className="
              mt-6 max-w-3xl
              text-lg text-muted-foreground
            "
          >
            Realtime infrastructure
            telemetry powered by
            Prometheus and Grafana.
          </p>
        </section>

        <GrafanaPanel
          title="ChaosForge Metrics"
          path="/d"
        />
      </div>
    </AppShell>
  );
}