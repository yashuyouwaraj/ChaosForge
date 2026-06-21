"use client";

import Link from "next/link";

import { GITHUB_URL } from "@/data/landing";
import { useScrollReveal } from "@/hooks/useLandingEffects";

export function LandingCta() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-reveal relative flex justify-center overflow-hidden px-6 py-32 ${visible ? "visible" : ""}`}
    >
      <div className="hero-bottom-glow absolute inset-0 z-0 opacity-50" />
      <div className="glass-panel relative z-10 max-w-4xl rounded-[36px] border border-cyan-400/20 p-10 text-center md:p-16">
        <h2 className="text-4xl font-black text-white md:text-5xl">
          Scale your intelligence.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400 md:text-xl">
          Join teams building the next generation of resilient infrastructure with
          distributed load testing, chaos engineering, and AI-powered operations.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="hero-cta-primary rounded-2xl px-10 py-4 text-lg font-bold text-slate-950 transition hover:scale-[1.02]"
          >
            Start Free Trial
          </Link>
          <Link
            href="/projects"
            className="hero-cta-secondary rounded-2xl px-10 py-4 text-lg font-bold text-cyan-100 transition hover:bg-white/8"
          >
            Create Project
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/10 px-10 py-4 text-lg font-bold text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            View GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
