"use client";

import Link from "next/link";

const NAV_LINKS = [
  { label: "Platform", href: "/dashboard" },
  { label: "Simulations", href: "/simulations" },
  { label: "Chaos", href: "/chaos" },
  { label: "AI", href: "/ai" },
  { label: "Reports", href: "/reports" },
];

export function LandingNav() {
  return (
    <nav
      className="landing-nav fixed inset-x-0 top-0 z-50 px-6 py-4"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="ChaosForge home">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/12 text-sm font-black text-cyan-300">
            CF
          </div>
          <div className="text-left">
            <span className="block text-lg font-bold text-white">ChaosForge</span>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Infrastructure OS
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="landing-nav-link text-sm font-medium">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-cyan-300 sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="hero-cta-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </nav>
  );
}
