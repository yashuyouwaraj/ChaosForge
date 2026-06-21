"use client";

import Link from "next/link";

import { AI_SKILLS } from "@/data/landing";
import { useScrollReveal } from "@/hooks/useLandingEffects";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingAiCopilot() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="ai-copilot"
      className={`landing-reveal landing-section-gradient px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="AI Copilot"
          title="14 skills. Every operational question answered."
          description="From Ask ChaosForge to Executive Briefs — the copilot understands your runs, dashboards, reports, and chaos experiments."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {AI_SKILLS.map((skill, index) => (
            <Link
              key={skill.title}
              href={skill.href}
              className="glass-panel landing-card-glow card-hover group rounded-[24px] p-5 text-left"
              style={{ transitionDelay: `${index * 0.04}s` }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    skill.category === "deep"
                      ? "bg-purple-400/10 text-purple-300"
                      : "bg-cyan-400/10 text-cyan-300"
                  }`}
                >
                  {skill.category === "deep" ? "Deep" : "Fast"}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{skill.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{skill.description}</p>
              <span className="mt-3 inline-block text-xs font-medium text-cyan-400 opacity-0 transition group-hover:opacity-100">
                Try it →
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/ask"
            className="hero-cta-primary rounded-2xl px-8 py-4 text-lg font-semibold text-slate-950 transition hover:scale-[1.02]"
          >
            Ask ChaosForge
          </Link>
          <Link
            href="/ai"
            className="hero-cta-secondary rounded-2xl px-8 py-4 text-lg font-semibold text-cyan-100 transition hover:bg-white/8"
          >
            Explore AI Operations
          </Link>
        </div>
      </div>
    </section>
  );
}
