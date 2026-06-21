import Link from "next/link";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

export function MarketingPageShell({ eyebrow, title, description, children }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        {eyebrow ? (
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-400">{eyebrow}</p>
        ) : null}
        <h1 className="mt-6 text-4xl font-black text-white md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-6 text-lg leading-8 text-slate-400">{description}</p>
        ) : null}
        <div className="prose prose-invert mt-10 max-w-none space-y-6 text-slate-300">
          {children}
        </div>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/signup"
            className="hero-cta-primary rounded-2xl px-8 py-3 text-base font-semibold text-slate-950 transition hover:scale-[1.02]"
          >
            Start Free Trial
          </Link>
          <Link
            href="/"
            className="hero-cta-secondary rounded-2xl px-8 py-3 text-base font-semibold text-cyan-100 transition hover:bg-white/8"
          >
            Back to Home
          </Link>
        </div>
      </div>
      <LandingFooter />
    </main>
  );
}
