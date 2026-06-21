"use client";

import Link from "next/link";

import { PRICING_PLANS } from "@/data/landing";
import { useScrollReveal } from "@/hooks/useLandingEffects";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingPricing() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="pricing"
      className={`landing-reveal px-6 py-24 ${visible ? "visible" : ""}`}
    >
      <div className="mx-auto max-w-7xl space-y-16">
        <LandingSectionHeader
          eyebrow="Pricing"
          title="Transparent scale"
          description="Enterprise-grade infrastructure intelligence without enterprise opacity."
        />

        <div className="grid items-center gap-8 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`glass-panel relative flex h-full flex-col rounded-[30px] p-8 text-left ${
                plan.highlighted
                  ? "hero-pricing-featured border-cyan-400/40 bg-cyan-400/[0.08] md:scale-[1.03]"
                  : ""
              }`}
            >
              {plan.badge ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-950">
                  {plan.badge}
                </div>
              ) : null}

              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span
                    className={`text-[3rem] font-black leading-none ${
                      plan.highlighted ? "text-cyan-300" : "text-white"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.suffix ? (
                    <span className="text-base text-slate-400">{plan.suffix}</span>
                  ) : null}
                </div>
                <p className="mt-3 text-base leading-7 text-slate-400">{plan.subtitle}</p>
              </div>

              <ul className="mb-8 flex flex-1 flex-col gap-3 text-sm text-slate-300">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-300">
                      +
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full rounded-xl px-6 py-3 text-center text-base font-bold transition ${
                  plan.highlighted
                    ? "hero-cta-primary text-slate-950 hover:scale-[1.01]"
                    : "hero-cta-secondary text-white hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
