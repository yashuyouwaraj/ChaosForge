"use client";

import { PRODUCT_METRICS } from "@/data/landing";
import { useAnimatedCounter, useScrollReveal } from "@/hooks/useLandingEffects";

function MetricCard({ metric, active }) {
  const count = useAnimatedCounter(metric.value, 1800, active);

  return (
    <div className="glass-panel landing-card-glow card-hover rounded-[28px] p-8 text-center">
      <h3 className="text-5xl font-black text-cyan-300 md:text-6xl">{count}</h3>
      <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
      {metric.subtext ? (
        <p className="mt-2 text-sm text-slate-500">{metric.subtext}</p>
      ) : null}
    </div>
  );
}

export function LandingMetrics() {
  const { ref, visible } = useScrollReveal();

  return (
    <section ref={ref} className={`landing-reveal relative z-10 -mt-10 px-6 pb-24 pt-32 ${visible ? "visible" : ""}`}>
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_METRICS.map((metric) => (
          <MetricCard key={metric.label} metric={metric} active={visible} />
        ))}
      </div>
    </section>
  );
}
