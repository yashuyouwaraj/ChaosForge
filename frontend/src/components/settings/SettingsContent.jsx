"use client";

import { useSettings } from "@/hooks/useSettings";

import { AccountCard } from "./AccountCard";
import { AppearanceCard } from "./AppearanceCard";
import { PasswordCard } from "./PasswordCard";
import { SimulationDefaultsCard } from "./SimulationDefaultsCard";
import { NotificationCard } from "./NotificationCard";
import { DangerZoneCard } from "./DangerZoneCard";
import { AiSettingsCard } from "./AiSettingsCard";

export function SettingsContent() {
  const { settings, loading, error, updateSettings, refreshSettings, saved, dirty } =
    useSettings();

  if (loading) {
    return (
      <div className="space-y-8">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="glass rounded-[32px] p-8">
            <div className="h-7 w-52 animate-pulse rounded-xl bg-white/10" />
            <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded-xl bg-white/10" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          glass rounded-[32px]
          border border-red-500/20
          bg-red-500/5
          p-10
        "
      >
        <h2 className="text-2xl font-black text-red-300">
          Failed to load settings
        </h2>

        <p className="mt-3 text-slate-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end gap-3">
        <div
          className={`
            rounded-full border px-4 py-2 text-sm font-semibold transition
            ${
              saved
                ? "border-green-500/20 bg-green-500/10 text-green-300"
                : dirty
                  ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                  : "border-white/10 bg-black/20 text-muted-foreground"
            }
          `}
        >
          {saved ? "✓ Saved" : dirty ? "Saving..." : "All changes saved"}
        </div>
        <button
          type="button"
          disabled={!dirty}
          className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-muted-foreground disabled:opacity-50"
        >
          Save
        </button>
      </div>

      <AccountCard settings={settings} />

      <PasswordCard />

      <AppearanceCard settings={settings} updateSettings={updateSettings} />

      <SimulationDefaultsCard
        settings={settings}
        updateSettings={updateSettings}
      />

      <NotificationCard settings={settings} updateSettings={updateSettings} />

      <AiSettingsCard settings={settings} updateSettings={updateSettings} />

      <DangerZoneCard reloadSettings={refreshSettings} />
    </div>
  );
}
