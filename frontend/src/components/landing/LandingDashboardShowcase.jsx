"use client";

import Link from "next/link";

import { useScrollReveal } from "@/hooks/useLandingEffects";
import { LandingSectionHeader } from "./LandingSectionHeader";

const DASHBOARD_METRICS = [
  { label: "Requests/sec", value: "8,420", trend: "+12%" },
  { label: "Error Rate", value: "0.8%", trend: "-0.3%" },
  { label: "Active Workers", value: "6", trend: "Kafka" },
  { label: "WS Events/s", value: "1,240", trend: "Live" },
];

export function LandingDashboardShowcase() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="dashboard"
      className={`landing-reveal px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="Live Dashboard"
          title="Realtime operational control surface"
          description="Monitor RPS, latency buckets, error rates, and WebSocket telemetry while simulations run — the same dashboard your team uses in production."
        />

        <div className="landing-dashboard-preview glass-panel overflow-hidden rounded-[32px]">
          <div className="border-b border-white/5 bg-white/[0.02] px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="landing-pulse-dot h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="text-sm font-medium text-white">Simulation Run #A7F2</span>
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                  Running
                </span>
              </div>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Open Dashboard →
              </Link>
            </div>
          </div>

          <div className="grid gap-px bg-white/5 md:grid-cols-4">
            {DASHBOARD_METRICS.map((metric) => (
              <div key={metric.label} className="bg-[rgba(3,8,22,0.6)] p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{metric.label}</p>
                <p className="mt-2 text-3xl font-black text-white">{metric.value}</p>
                <p className="mt-1 text-xs text-cyan-300">{metric.trend}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-3">
            <div className="glass rounded-[24px] p-6 lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">RPS Over Time</p>
              <div className="mt-6 flex h-40 items-end gap-1">
                {[40, 55, 48, 62, 58, 75, 82, 78, 88, 92, 85, 90, 95, 88, 92, 98].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="landing-chart-bar flex-1 rounded-t bg-gradient-to-t from-cyan-600/30 to-cyan-400/80"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.04}s` }}
                    />
                  ),
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-[24px] p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Health Score</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-black text-green-400">87</span>
                  <span className="mb-2 text-lg text-slate-400">/100</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-green-500 to-cyan-400" />
                </div>
              </div>

              <div className="glass rounded-[24px] p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Predictive Risk</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-black text-yellow-400">23</span>
                  <span className="mb-2 text-lg text-slate-400">%</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">Low — within acceptable threshold</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 p-6">
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-slate-400">
              WebSocket Activity
            </p>
            <div className="space-y-2 font-mono text-xs">
              {[
                "metrics:rps → 8420 req/s",
                "metrics:latency:p99 → 48ms",
                "chaos:latency → injected 200ms",
                "intelligence:health → 87/100",
              ].map((event) => (
                <div
                  key={event}
                  className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-4 py-2 text-slate-300"
                >
                  <span className="landing-pulse-dot h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  {event}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
