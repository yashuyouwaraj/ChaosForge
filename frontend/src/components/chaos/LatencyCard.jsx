"use client";

import { Activity, Clock3, Gauge } from "lucide-react";

export function LatencyCard({ chaos, setChaos }) {
  const updateLatency = (field, value) => {
    setChaos({
      ...chaos,
      latency: {
        ...chaos.latency,
        [field]: value,
      },
    });
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Clock3 size={22} className="text-cyan-400" />
            <h2 className="text-2xl font-black">Latency Injection</h2>
          </div>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Introduce artificial latency to emulate slow APIs, overloaded
            servers, and unstable networks.
          </p>
        </div>

        <div className="min-w-[180px] rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Average Delay
          </p>
          <p className="mt-2 text-3xl font-black">
            {Math.round((chaos.latency.min + chaos.latency.max) / 2)}ms
          </p>
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <span>Enable Latency Injection</span>
        <input
          type="checkbox"
          aria-label="Enable latency injection"
          className="h-5 w-5 accent-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
          checked={chaos.latency.enabled}
          onChange={(event) => updateLatency("enabled", event.target.checked)}
        />
      </label>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="chaos-latency-min" className="text-sm font-medium">
            Minimum (ms)
          </label>
          <input
            id="chaos-latency-min"
            type="number"
            min={0}
            value={chaos.latency.min}
            onChange={(event) =>
              updateLatency("min", Number(event.target.value))
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        <div>
          <label htmlFor="chaos-latency-max" className="text-sm font-medium">
            Maximum (ms)
          </label>
          <input
            id="chaos-latency-max"
            type="number"
            min={chaos.latency.min}
            value={chaos.latency.max}
            onChange={(event) =>
              updateLatency("max", Number(event.target.value))
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <label htmlFor="chaos-latency-percentage">
              Injection Probability
            </label>
            <span className="font-bold">{chaos.latency.percentage}%</span>
          </div>
          <input
            id="chaos-latency-percentage"
            type="range"
            min={0}
            max={100}
            value={chaos.latency.percentage}
            onChange={(event) =>
              updateLatency("percentage", Number(event.target.value))
            }
            className="mt-4 w-full accent-cyan-400"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-cyan-400" />
            <span className="font-semibold">Delay Range</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-slate-400">Minimum</p>
              <p className="mt-1 text-xl font-bold">{chaos.latency.min}ms</p>
            </div>
            <Activity size={22} className="shrink-0 text-cyan-400" />
            <div className="text-right">
              <p className="text-xs uppercase text-slate-400">Maximum</p>
              <p className="mt-1 text-xl font-bold">{chaos.latency.max}ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
