"use client";

import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { countEnabledFaults } from "@/lib/chaos";

const OverviewCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}) => (
  <div
    className="
      glass rounded-3xl
      border border-white/10
      p-6 transition
      hover:-translate-y-1
      hover:border-cyan-400/20
    "
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          {title}
        </p>

        <h3 className="mt-3 text-3xl font-black">
          {value}
        </h3>

        {subtitle && (
          <p className="mt-2 text-xs text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={`
          rounded-2xl
          p-4
          ${color}
        `}
      >
        <Icon size={26} />
      </div>
    </div>
  </div>
);

export function ChaosOverviewGrid({ chaos }) {
  const enabledFaults = countEnabledFaults(chaos);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <OverviewCard
        title="Chaos Status"
        value={chaos.enabled ? "Enabled" : "Disabled"}
        subtitle="Global engine state"
        icon={chaos.enabled ? ShieldAlert : ShieldCheck}
        color={
          chaos.enabled
            ? "bg-red-500/10 text-red-400"
            : "bg-emerald-500/10 text-emerald-400"
        }
      />

      <OverviewCard
        title="Profile"
        value={`${chaos.profile[0].toUpperCase()}${chaos.profile.slice(1)}`}
        subtitle="Current preset"
        icon={Activity}
        color="bg-cyan-500/10 text-cyan-400"
      />

      <OverviewCard
        title="Faults Enabled"
        value={enabledFaults}
        subtitle="Injection types active"
        icon={Zap}
        color="bg-amber-500/10 text-amber-400"
      />

      <OverviewCard
        title="Failure Rate"
        value={`${chaos.failureRate}%`}
        subtitle="HTTP failure probability"
        icon={Activity}
        color="bg-purple-500/10 text-purple-400"
      />
    </div>
  );
}
