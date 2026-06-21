"use client";

import Link from "next/link";

import { WORKFLOW_STEPS } from "@/data/landing";
import { LandingSectionHeader, ScrollRevealSection } from "./LandingSectionHeader";

export function LandingWorkflow() {
  return (
    <ScrollRevealSection id="workflow" className="landing-section-gradient px-6 py-24">
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="Product Workflow"
          title="From project to production confidence"
          description="Every step is built into ChaosForge — create a project, run traffic, inject chaos, and get AI-powered reports without switching tools."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((step, index) => (
            <Link
              key={step.title}
              href={step.href}
              className={`landing-workflow-step glass-panel landing-card-glow card-hover group rounded-[24px] p-6 text-left transition ${
                index % 4 !== 3 ? "md:mb-0" : ""
              }`}
              style={{ transitionDelay: `${index * 0.05}s` }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-sm font-bold text-cyan-300 transition group-hover:bg-cyan-400/20">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
              <span className="mt-4 inline-block text-xs font-medium text-cyan-400 opacity-0 transition group-hover:opacity-100">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </ScrollRevealSection>
  );
}
