"use client";

import { COMPARISONS } from "@/data/landing";
import { useScrollReveal } from "@/hooks/useLandingEffects";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingComparison() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="comparison"
      className={`landing-reveal px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="Why ChaosForge"
          title="One platform. Three problems solved."
          description="ChaosForge unifies load testing, observability, and chaos engineering — with AI intelligence on every run."
        />

        <div className="grid gap-8 lg:grid-cols-3">
          {COMPARISONS.map((comparison) => (
            <div key={comparison.title} className="glass-panel rounded-[28px] p-6">
              <h3 className="text-center text-lg font-bold text-white">
                ChaosForge vs {comparison.title}
              </h3>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.25em] text-cyan-400">
                    ChaosForge
                  </p>
                  <ul className="space-y-2">
                    {comparison.chaosForge.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-0.5 text-cyan-400">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-500">
                    {comparison.title}
                  </p>
                  <ul className="space-y-2">
                    {comparison.traditional.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-500">
                        <span className="mt-0.5">—</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
