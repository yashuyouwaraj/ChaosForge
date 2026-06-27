"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

import { LandingClosing } from "@/components/landing/LandingClosing";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingIntelligenceAi } from "@/components/landing/LandingIntelligenceAi";
import { LandingLiveOperations } from "@/components/landing/LandingLiveOperations";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingPlatformOverview } from "@/components/landing/LandingPlatformOverview";
import { LandingReportsComparison } from "@/components/landing/LandingReportsComparison";
import { wakeBackend } from "@/lib/runtime";

const LazyPlatformOverview = dynamic(
  () =>
    Promise.resolve({ default: LandingPlatformOverview }),
  { ssr: false },
);

const LazyLiveOperations = dynamic(
  () => Promise.resolve({ default: LandingLiveOperations }),
  { ssr: false },
);

const LazyIntelligenceAi = dynamic(
  () => Promise.resolve({ default: LandingIntelligenceAi }),
  { ssr: false },
);

const LazyChaos = dynamic(
  () => import("@/components/landing/LandingChaos").then((m) => ({ default: m.LandingChaos })),
  { ssr: false },
);

const LazyReportsComparison = dynamic(
  () => Promise.resolve({ default: LandingReportsComparison }),
  { ssr: false },
);

const LazyClosing = dynamic(
  () => Promise.resolve({ default: LandingClosing }),
  { ssr: false },
);

const LazyFooter = dynamic(
  () => import("@/components/landing/LandingFooter").then((m) => ({ default: m.LandingFooter })),
  { ssr: false },
);

export default function HomePage() {
  useEffect(() => {
    wakeBackend();
  }, []);

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <LandingNav />
      <LandingHero />
      <LazyPlatformOverview />
      <LazyLiveOperations />
      <LazyIntelligenceAi />
      <LazyChaos />
      <LazyReportsComparison />
      <LazyClosing />
      <LazyFooter />
    </main>
  );
}
