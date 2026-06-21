"use client";

import Link from "next/link";

import { FOOTER_LINKS, SOCIAL_LINKS } from "@/data/landing";

function FooterLink({ link }) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-base text-slate-400 transition-colors hover:text-cyan-300"
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className="text-base text-slate-400 transition-colors hover:text-cyan-300"
    >
      {link.label}
    </Link>
  );
}

export function LandingFooter() {
  const groups = [
    { title: "Product", links: FOOTER_LINKS.product },
    { title: "Resources", links: FOOTER_LINKS.resources },
    { title: "Company", links: FOOTER_LINKS.company },
    { title: "Legal", links: FOOTER_LINKS.legal },
  ];

  return (
    <footer className="border-t border-white/5 bg-[rgba(2,6,23,0.56)] px-6 pb-10 pt-20">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4 lg:grid-cols-6">
        <div className="space-y-4 md:col-span-2 lg:col-span-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/12 text-sm font-black text-cyan-300">
              CF
            </div>
            <span className="text-2xl font-bold text-white">ChaosForge</span>
          </Link>
          <p className="max-w-xs text-base leading-7 text-slate-400">
            AI-native distributed infrastructure intelligence platform. Built for
            distributed resilience.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="text-sm text-slate-400 transition hover:text-cyan-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.title} className="flex flex-col space-y-3">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-300">
              {group.title}
            </h4>
            {group.links.map((link) => (
              <FooterLink key={link.label} link={link} />
            ))}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-white/5 pt-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} ChaosForge Intelligence. All rights reserved.
      </div>
    </footer>
  );
}
