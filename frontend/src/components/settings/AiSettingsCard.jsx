"use client";

import { useEffect } from "react";

import { useAiModels } from "@/hooks/useAiCopilot";

const FALLBACK_MODES = [
  { id: "automatic", label: "Automatic (Recommended)" },
  { id: "fast", label: "Fast" },
  { id: "balanced", label: "Balanced" },
  { id: "deep", label: "Deep Reasoning" },
  { id: "custom", label: "Custom" },
];

export function AiSettingsCard({ settings, updateSettings }) {
  const { models, modes, configured, loadModels } = useAiModels();
  const ai = settings?.ai || {
    provider: "nvidia",
    mode: "automatic",
    model: "ultra",
  };

  useEffect(() => {
    loadModels().catch(() => {});
  }, [loadModels]);

  const availableModes = modes.length > 0 ? modes : FALLBACK_MODES;
  const isCustom = ai.mode === "custom";

  return (
    <div className="glass rounded-[32px] p-8">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
        AI Copilot
      </p>
      <h2 className="mt-3 text-3xl font-black">AI Settings</h2>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Configure NVIDIA provider, routing mode, and model preferences. The AI
        Router selects models by skill automatically unless you override with
        Custom mode. Intelligence metrics always come from the Intelligence
        Engine.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="text-sm text-muted-foreground">Provider</span>
          <select
            value={ai.provider || "nvidia"}
            onChange={(event) =>
              updateSettings({
                ai: {
                  ...ai,
                  provider: event.target.value,
                },
              })
            }
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none"
          >
            <option value="nvidia">NVIDIA</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-muted-foreground">Mode</span>
          <select
            value={ai.mode || "automatic"}
            onChange={(event) =>
              updateSettings({
                ai: {
                  ...ai,
                  mode: event.target.value,
                },
              })
            }
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none"
          >
            {availableModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            {
              availableModes.find((mode) => mode.id === (ai.mode || "automatic"))
                ?.description
            }
          </p>
        </label>

        {isCustom && (
          <label className="block md:col-span-2">
            <span className="text-sm text-muted-foreground">Model</span>
            <select
              value={ai.model || "ultra"}
              onChange={(event) =>
                updateSettings({
                  ai: {
                    ...ai,
                    model: event.target.value,
                  },
                })
              }
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 outline-none"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.displayName || model.name} — {model.speed} ·{" "}
                  {model.reasoning} reasoning
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {models.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.slice(0, 6).map((model) => (
            <div
              key={model.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <p className="font-bold text-slate-200">{model.displayName}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {model.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                  {model.speed}
                </span>
                {model.supportsStreaming && (
                  <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cyan-300">
                    Stream
                  </span>
                )}
                {model.supportsThinking && (
                  <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-purple-300">
                    Thinking
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-muted-foreground">
        {configured
          ? "NVIDIA provider is configured and ready. Model routing is handled by the backend AI Router."
          : "NVIDIA API key is not configured on the server. Copilot will explain Intelligence Engine results without LLM enrichment."}
      </div>
    </div>
  );
}
