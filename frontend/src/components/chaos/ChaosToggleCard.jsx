"use client";

import { Power } from "lucide-react";

export function ChaosToggleCard({ chaos, setChaos }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <Power className="h-5 w-5 text-cyan-400" />
        <h2 className="text-xl font-bold">Chaos Engine</h2>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Enable or disable fault injection for this project.
      </p>

      <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <span>Enable Chaos Engineering</span>

        <input
          type="checkbox"
          aria-label="Enable Chaos Engineering"
          className="h-5 w-5 accent-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
          checked={chaos.enabled}
          onChange={(event) =>
            setChaos({
              ...chaos,
              enabled: event.target.checked,
            })
          }
        />
      </label>
    </div>
  );
}
