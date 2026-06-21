"use client";

import Link from "next/link";

import { INTELLIGENCE_ENGINES, PLATFORM_FEATURES } from "@/data/landing";
import { useScrollReveal } from "@/hooks/useLandingEffects";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingPlatformFeatures() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-reveal relative px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="Platform Capabilities"
          title="Architected for chaos"
          description="Deep visibility into distributed systems through unified telemetry, realtime observability, and AI-native intelligence."
        />

        <div className="grid auto-rows-[280px] gap-6 md:grid-cols-12">
          <article className="glass-panel card-hover group relative overflow-hidden rounded-[30px] p-8 md:col-span-8">
            <div className="hero-bento-glow absolute right-0 top-0 h-full w-[45%] opacity-50 transition-opacity duration-300 group-hover:opacity-90" />
            <div className="absolute right-8 top-8 text-[7rem] font-black leading-none text-cyan-400/12">
              HUB
            </div>
            <div className="relative z-10 flex h-full max-w-xl flex-col justify-end text-left">
              <h3 className="text-3xl font-bold text-white md:text-4xl">
                {PLATFORM_FEATURES[0].title}
              </h3>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                {PLATFORM_FEATURES[0].description}
              </p>
              <Link href="/simulations" className="mt-4 text-sm font-medium text-cyan-400">
                Launch Simulation →
              </Link>
            </div>
          </article>

          <article className="glass-panel card-hover relative flex flex-col justify-between overflow-hidden rounded-[30px] p-8 text-left md:col-span-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-lg font-bold text-cyan-300">
                WS
              </div>
              <h3 className="text-2xl font-bold text-white">{PLATFORM_FEATURES[1].title}</h3>
            </div>
            <p className="mt-8 text-lg leading-8 text-slate-400">
              {PLATFORM_FEATURES[1].description}
            </p>
          </article>

          <article className="glass-panel card-hover relative flex flex-col justify-between overflow-hidden rounded-[30px] p-8 text-left md:col-span-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-lg font-bold text-cyan-300">
                PM
              </div>
              <h3 className="text-2xl font-bold text-white">{PLATFORM_FEATURES[2].title}</h3>
            </div>
            <p className="mt-8 text-lg leading-8 text-slate-400">
              {PLATFORM_FEATURES[2].description}
            </p>
            <Link href="/observability" className="text-sm font-medium text-cyan-400">
              View Observability →
            </Link>
          </article>

          <article className="glass-panel card-hover group relative overflow-hidden rounded-[30px] p-8 md:col-span-8">
            <div className="hero-ai-panel absolute inset-0 opacity-55 transition-opacity duration-300 group-hover:opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-transparent" />
            <div className="relative z-10 flex h-full max-w-xl flex-col justify-end text-left">
              <h3 className="text-3xl font-bold text-white md:text-4xl">
                {PLATFORM_FEATURES[3].title}
              </h3>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                {PLATFORM_FEATURES[3].description}
              </p>
              <Link href="/ai" className="mt-4 text-sm font-medium text-cyan-400">
                Explore AI →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function LandingIntelligence() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="intelligence"
      className={`landing-reveal landing-section-gradient px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="Intelligence Engine"
          title="11 engines. One operational picture."
          description="Every simulation run is analyzed by dedicated intelligence engines — from health scoring to deployment readiness."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {INTELLIGENCE_ENGINES.map((engine, index) => (
            <div
              key={engine.title}
              className="glass-panel landing-card-glow card-hover rounded-[24px] p-6 text-left"
              style={{ transitionDelay: `${index * 0.05}s` }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-xs font-bold text-cyan-300">
                {engine.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{engine.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{engine.description}</p>
            </div>
          ))}

          <Link
            href="/ai"
            className="glass-panel card-hover flex flex-col items-center justify-center rounded-[24px] border border-dashed border-cyan-400/20 p-6 text-center transition hover:border-cyan-400/40"
          >
            <span className="text-3xl font-black text-cyan-400">+4</span>
            <span className="mt-2 text-sm text-slate-400">Trends, Resilience, Operational Insights & more</span>
            <span className="mt-4 text-sm font-medium text-cyan-400">View all engines →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
