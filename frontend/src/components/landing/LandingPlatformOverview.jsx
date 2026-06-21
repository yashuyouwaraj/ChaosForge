"use client";

import { LandingIntelligence, LandingPlatformFeatures } from "@/components/landing/LandingIntelligence";
import { LandingMetrics } from "@/components/landing/LandingMetrics";
import { LandingWorkflow } from "@/components/landing/LandingWorkflow";

export function LandingPlatformOverview() {
  return (
    <>
      <LandingMetrics />
      <LandingWorkflow />
      <LandingPlatformFeatures />
    </>
  );
}
