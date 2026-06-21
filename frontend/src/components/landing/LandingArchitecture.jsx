"use client";

import { ARCHITECTURE_STEPS } from "@/data/landing";
import { useScrollReveal } from "@/hooks/useLandingEffects";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingArchitecture() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="architecture"
      className={`landing-reveal landing-section-gradient px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="Architecture"
          title="Built for distributed resilience"
          description="From browser to AI reports — every layer is designed for production-style distributed workflow orchestration."
        />

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {ARCHITECTURE_STEPS.map((step, index) => (
            <div
              key={step.label}
              className="landing-timeline-node glass-panel landing-card-glow card-hover rounded-[20px] p-5 text-center"
              style={{ transitionDelay: `${index * 0.06}s` }}
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-xs font-bold text-cyan-300">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="text-sm font-bold text-white">{step.label}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
