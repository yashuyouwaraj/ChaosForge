"use client";

import { LandingAiCopilot } from "@/components/landing/LandingAiCopilot";
import { LandingIntelligence } from "@/components/landing/LandingIntelligence";
import { LandingNvidiaAi } from "@/components/landing/LandingNvidiaAi";

export function LandingIntelligenceAi() {
  return (
    <>
      <LandingIntelligence />
      <LandingAiCopilot />
      <LandingNvidiaAi />
    </>
  );
}
