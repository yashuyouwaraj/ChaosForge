"use client";

import { useEffect } from "react";

import { api } from "@/lib/api";
import { wakeGrafana, wakePrometheus } from "@/lib/observability";
import { GrafanaPanel } from "@/components/observability/GrafanaPanel";
import { ObservabilitySummary } from "@/components/observability/ObservabilitySummary";
import { PrometheusPanel } from "@/components/observability/PrometheusPanel";
import { PageHeader } from "@/components/shared/PageHeader";

export function ObservabilityWorkspace() {
  useEffect(() => {
    wakeGrafana();
    wakePrometheus();
    api("/health/wake", "POST").catch(() => {});
  }, []);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Realtime telemetry"
        title="Observability Workspace"
        description="Unified infrastructure telemetry powered by Prometheus, Grafana, realtime metrics, and distributed monitoring systems."
      />

      <ObservabilitySummary />

      <GrafanaPanel />

      <PrometheusPanel />
    </div>
  );
}
