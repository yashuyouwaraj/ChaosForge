"use client";

import Link from "next/link";

import { CHAOS_FAULT_TYPES, CHAOS_PROFILES } from "@/data/landing";
import { useScrollReveal } from "@/hooks/useLandingEffects";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingChaos() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="chaos"
      className={`landing-reveal px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="Chaos Engineering"
          title="Fault injection under real traffic"
          description="Simulate latency, packet loss, HTTP failures, connection resets, and timeouts — while your distributed load test runs."
        />

        <div>
          <h3 className="mb-6 text-center text-sm uppercase tracking-[0.35em] text-slate-400">
            Supported Fault Types
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CHAOS_FAULT_TYPES.map((fault, index) => (
              <div
                key={fault.title}
                className="glass-panel landing-card-glow card-hover rounded-[24px] p-5 text-center"
                style={{ animationDelay: `${index * 0.4}s`, transitionDelay: `${index * 0.05}s` }}
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10 text-xs font-bold text-red-300">
                  {fault.icon}
                </div>
                <h4 className="font-bold text-white">{fault.title}</h4>
                <p className="mt-2 text-xs leading-5 text-slate-400">{fault.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-center text-sm uppercase tracking-[0.35em] text-slate-400">
            Chaos Profiles
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CHAOS_PROFILES.map((profile) => (
              <div
                key={profile.name}
                className={`glass-panel card-hover rounded-[24px] p-5 text-left ${
                  profile.active ? "border-cyan-400/20" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">{profile.name}</h4>
                  {profile.active ? (
                    <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-300">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{profile.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/chaos"
            className="hero-cta-secondary inline-block rounded-2xl px-8 py-4 text-lg font-semibold text-cyan-100 transition hover:bg-white/8"
          >
            Explore Chaos Engineering
          </Link>
        </div>
      </div>
    </section>
  );
}
