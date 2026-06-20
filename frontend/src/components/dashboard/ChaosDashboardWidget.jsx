"use client";

import Link from "next/link";
import { Activity, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

import { ChaosStatusBadge } from "@/components/chaos/ChaosStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useRun } from "@/components/providers/RunProvider";
import { useChaosSettings } from "@/hooks/useChaosSettings";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";
import { countEnabledFaults } from "@/lib/chaos";

const percentage = (part, total) =>
  total > 0 ? ((Number(part || 0) / Number(total)) * 100).toFixed(1) : "0.0";

const metrics = (chaos, runMetrics) => [
  {
    label: "Enabled",
    value: <ChaosStatusBadge enabled={chaos.enabled} />,
    icon: ShieldCheck,
  },
  {
    label: "Current Profile",
    value: `${chaos.profile[0].toUpperCase()}${chaos.profile.slice(1)}`,
    icon: Activity,
  },
  {
    label: "Injection Rate",
    value: `${percentage(runMetrics?.chaosInjected, runMetrics?.totalRequests)}%`,
    icon: Zap,
  },
  {
    label: "Total Injected Requests",
    value: runMetrics?.chaosInjected || 0,
    icon: AlertTriangle,
  },
  {
    label: "Resilience Score",
    value: `${percentage(runMetrics?.chaosSuccess, runMetrics?.chaosInjected)}%`,
    icon: ShieldCheck,
  },
  {
    label: "Faults Enabled",
    value: countEnabledFaults(chaos),
    icon: Zap,
  },
];

export function ChaosDashboardWidget() {
  const { projectId, chaos, loading, error } = useChaosSettings();
  const { selectedRun } = useRun();
  const runMetrics = useRealtimeMetrics(
    selectedRun?.projectId,
    selectedRun?.runId,
  );

  if (!projectId) {
    return (
      <EmptyState
        title="No project selected"
        description="Select a project to view its Chaos Engineering posture."
        className="p-8"
      />
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="glass rounded-[24px] p-5">
            <div className="h-4 w-28 animate-pulse rounded-lg bg-white/10" />
            <div className="mt-5 h-8 w-24 animate-pulse rounded-lg bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !chaos) {
    return (
      <EmptyState
        title="Chaos status unavailable"
        description={error || "Unable to load this project's configuration."}
        className="border-red-500/20 bg-red-500/5 p-8"
      />
    );
  }

  return (
    <div className="glass rounded-[32px] p-6 lg:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            Project Resilience
          </p>
          <h3 className="mt-3 text-2xl font-black">Chaos Engineering</h3>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-10 rounded-xl border-cyan-400/30 bg-cyan-400/10 px-4 text-cyan-100 hover:bg-cyan-400/20"
        >
          <Link href="/chaos">Open Controls</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metrics(chaos, runMetrics).map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="mt-3 text-2xl font-black">{value}</div>
              </div>
              <Icon className="h-5 w-5 shrink-0 text-cyan-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
