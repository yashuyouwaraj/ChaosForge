"use client";

import Link from "next/link";

import { EXPORT_FORMATS, REPORT_SECTIONS } from "@/data/landing";
import { useScrollReveal } from "@/hooks/useLandingEffects";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingReports() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="reports"
      className={`landing-reveal landing-section-gradient px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="Operational Reports"
          title="Executive-ready intelligence on every run"
          description="Comprehensive operational reports with health scores, risk analysis, root cause, chaos summaries, and deployment readiness."
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="glass-panel landing-dashboard-preview rounded-[32px] p-8 lg:col-span-3">
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Operational Report
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">Run #A7F2 — Executive Brief</h3>
              </div>
              <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs text-green-300">
                Health: 87/100
              </span>
            </div>

            <div className="space-y-4">
              {REPORT_SECTIONS.slice(0, 6).map((section) => (
                <div
                  key={section}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/10 text-[10px] text-cyan-300">
                    ✓
                  </span>
                  <span className="text-sm text-slate-300">{section}</span>
                </div>
              ))}
              <p className="text-xs text-slate-500">+ {REPORT_SECTIONS.length - 6} more sections</p>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {EXPORT_FORMATS.map((format) => (
              <div
                key={format.format}
                className="glass-panel card-hover rounded-[24px] p-6 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-xs font-bold uppercase text-cyan-300">
                    {format.ext}
                  </span>
                  <div>
                    <h4 className="font-bold text-white">{format.format} Export</h4>
                    <p className="text-sm text-slate-400">{format.description}</p>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/reports"
              className="hero-cta-primary block rounded-2xl px-6 py-4 text-center text-base font-bold text-slate-950 transition hover:scale-[1.01]"
            >
              Explore Reports
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
