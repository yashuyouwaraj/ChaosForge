"use client";

import { useScrollReveal } from "@/hooks/useLandingEffects";

export function LandingSectionHeader({ eyebrow, title, description, className = "" }) {
  return (
    <div className={`mx-auto max-w-3xl text-center ${className}`}>
      {eyebrow ? (
        <p className="text-sm uppercase tracking-[0.4em] text-cyan-400">{eyebrow}</p>
      ) : null}
      <h2 className="mt-6 text-4xl font-black text-white md:text-5xl lg:text-6xl">{title}</h2>
      {description ? (
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400 md:text-xl">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function ScrollRevealSection({ children, className = "", id }) {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id={id}
      ref={ref}
      className={`landing-reveal ${visible ? "visible" : ""} ${className}`.trim()}
    >
      {children}
    </section>
  );
}
