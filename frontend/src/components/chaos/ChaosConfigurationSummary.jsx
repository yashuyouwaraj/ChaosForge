"use client";

import { ChaosStatusBadge } from "./ChaosStatusBadge";

const configurationRows = (chaos) => [
  {
    label: "Profile",
    value: chaos.profile,
    enabled: chaos.enabled,
    isProfile: true,
  },
  { label: "Latency", enabled: chaos.latency.enabled },
  { label: "Failure", enabled: chaos.statusCode.enabled },
  { label: "Timeout", enabled: chaos.timeout.enabled },
  { label: "Packet Loss", enabled: chaos.packetLoss.enabled },
  { label: "Connection Reset", enabled: chaos.connectionReset.enabled },
];

export function ChaosConfigurationSummary({ chaos }) {
  return (
    <section className="glass rounded-[32px] p-6 lg:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
          Configuration Summary
        </p>
        <h2 className="mt-3 text-2xl font-black lg:text-3xl">
          Fault Injection Controls
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          Review the active profile and each injector before starting a
          simulation.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {configurationRows(chaos).map((item) => (
          <div
            key={item.label}
            className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <span className="text-sm font-semibold text-slate-300">
              {item.label}
            </span>

            {item.isProfile ? (
              <span className="truncate text-sm font-bold capitalize text-cyan-300">
                {item.value}
              </span>
            ) : (
              <ChaosStatusBadge enabled={item.enabled} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
