"use client";

import { Activity, Gauge, Timer, Workflow } from "lucide-react";

import { usePlatform } from "@/components/providers/PlatformProvider";
import { useActiveSimulations } from "@/hooks/useActiveSimulations";

const average = (values) => {
  const numericValues = values
    .map((value) => Number(value || 0))
    .filter((value) => Number.isFinite(value));

  if (numericValues.length === 0) {
    return 0;
  }

  return Math.round(
    numericValues.reduce((total, value) => total + value, 0) /
      numericValues.length,
  );
};

function SummaryCard({ icon: Icon, label, value, detail, tone = "cyan" }) {
  const toneClass =
    tone === "green"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/20"
      : tone === "amber"
        ? "text-amber-300 bg-amber-500/10 border-amber-400/20"
        : "text-cyan-300 bg-cyan-500/10 border-cyan-400/20";

  return (
    <div className="glass rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {label}
          </p>
          <p className="mt-4 text-3xl font-black">{value}</p>
        </div>

        <div className={`rounded-2xl border p-3 ${toneClass}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

export function SimulationSummaryCards() {
  const activeRuns = useActiveSimulations();
  const { infrastructure } = usePlatform();
  const workerCount =
    infrastructure?.health?.kafkaWorkers?.connected ??
    infrastructure?.infrastructureSummary?.workers ??
    0;

  const currentThroughput = activeRuns.reduce(
    (total, run) => total + Number(run.currentRps || run.rps || 0),
    0,
  );
  const avgLatency = average(activeRuns.map((run) => run.avgLatency));

  return (
    <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
      <SummaryCard
        icon={Activity}
        label="Active Runs"
        value={activeRuns.length}
        detail="Realtime simulations currently eligible for orchestration."
        tone="green"
      />

      <SummaryCard
        icon={Workflow}
        label="Running Workers"
        value={workerCount}
        detail="Kafka worker executors connected to the traffic plane."
      />

      <SummaryCard
        icon={Gauge}
        label="Current Throughput"
        value={`${currentThroughput} RPS`}
        detail="Combined live request rate across active runs."
      />

      <SummaryCard
        icon={Timer}
        label="Avg Latency"
        value={`${avgLatency}ms`}
        detail="Mean observed latency across active simulations."
        tone="amber"
      />
    </div>
  );
}
