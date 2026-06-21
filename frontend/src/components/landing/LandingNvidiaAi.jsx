"use client";

import Link from "next/link";
import { useState } from "react";

import { NVIDIA_MODES, NVIDIA_MODELS } from "@/data/landing";
import { useScrollReveal } from "@/hooks/useLandingEffects";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingNvidiaAi() {
  const { ref, visible } = useScrollReveal();
  const [selectedMode, setSelectedMode] = useState("automatic");
  const [selectedModel, setSelectedModel] = useState("super");

  const activeMode = NVIDIA_MODES.find((m) => m.id === selectedMode);

  return (
    <section
      ref={ref}
      id="nvidia-ai"
      className={`landing-reveal px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="NVIDIA AI"
          title="Model routing built for infrastructure"
          description="8 NVIDIA NIM models with automatic skill-aware routing, streaming responses, and deep reasoning mode."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="glass rounded-[32px] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Routing Mode</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {NVIDIA_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSelectedMode(mode.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    selectedMode === mode.id
                      ? "border-cyan-400/40 bg-cyan-400/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                  aria-pressed={selectedMode === mode.id}
                >
                  <span className="block text-sm font-bold text-white">{mode.label}</span>
                </button>
              ))}
            </div>
            {activeMode ? (
              <p className="mt-4 text-sm leading-6 text-slate-400">{activeMode.description}</p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-2">
              {["Streaming", "Reasoning", "Structured Output"].map((feature) => (
                <span
                  key={feature}
                  className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-300"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="glass rounded-[32px] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Choose Your Model</p>
            <div className="mt-6 max-h-80 space-y-2 overflow-y-auto pr-2">
              {NVIDIA_MODELS.map((model) => (
                <button
                  key={model.key}
                  type="button"
                  onClick={() => setSelectedModel(model.key)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedModel === model.key
                      ? "border-cyan-400/40 bg-cyan-400/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                  aria-pressed={selectedModel === model.key}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{model.name}</span>
                    <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] uppercase text-slate-400">
                      {model.speed}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{model.use}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/settings"
            className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            Configure AI settings in platform →
          </Link>
        </div>
      </div>
    </section>
  );
}
