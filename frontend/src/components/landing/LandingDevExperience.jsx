"use client";

import { DEV_STACK } from "@/data/landing";
import { useScrollReveal } from "@/hooks/useLandingEffects";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingDevExperience() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="developer"
      className={`landing-reveal landing-section-gradient px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="Developer Experience"
          title="Production-grade stack, developer-first workflow"
          description="REST APIs, Kafka, Redis, MongoDB, Socket.IO, Docker, Prometheus, Grafana, JWT, and NVIDIA AI — all integrated."
        />

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {DEV_STACK.map((item, index) => (
            <div
              key={item.name}
              className="glass-panel landing-card-glow card-hover rounded-[20px] p-5 text-center"
              style={{ transitionDelay: `${index * 0.03}s` }}
            >
              <h3 className="text-sm font-bold text-white">{item.name}</h3>
              <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
