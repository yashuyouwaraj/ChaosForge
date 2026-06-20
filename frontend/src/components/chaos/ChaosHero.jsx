"use client";

import { ShieldAlert, ShieldCheck, Activity } from "lucide-react";

import { ChaosStatusBadge } from "./ChaosStatusBadge";

export function ChaosHero({ chaos }) {
  return (
    <section
      className="
        glass overflow-hidden
        rounded-[32px]
        border border-cyan-400/10
        p-8
      "
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p
            className="
              text-sm uppercase
              tracking-[0.35em]
              text-cyan-400
            "
          >
            Chaos Engineering
          </p>

          <h1 className="mt-4 text-4xl font-black lg:text-5xl">
            Fault Injection
          </h1>

          <p className="mt-4 max-w-3xl text-muted-foreground">
            Simulate real-world failures like latency, packet loss, HTTP
            failures, connection resets and timeouts to validate the resilience
            of your applications before production.
          </p>
        </div>

        <div
          className={`
            rounded-3xl border p-6 min-w-[250px]
            ${
              chaos.enabled
                ? "border-red-500/20 bg-red-500/10"
                : "border-emerald-500/20 bg-emerald-500/10"
            }
          `}
        >
          <div className="flex items-center gap-4">
            <div
              className={`
                rounded-2xl p-4
                ${chaos.enabled ? "bg-red-500/15" : "bg-emerald-500/15"}
              `}
            >
              {chaos.enabled ? (
                <ShieldAlert size={34} />
              ) : (
                <ShieldCheck size={34} />
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>

              <div className="mt-2">
                <ChaosStatusBadge enabled={chaos.enabled} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
            <Activity size={18} className="text-cyan-400" />

            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Active Profile
              </p>

              <p className="font-bold capitalize">{chaos.profile}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
