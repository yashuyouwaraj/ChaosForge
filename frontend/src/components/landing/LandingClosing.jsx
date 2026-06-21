"use client";

import { LandingCta } from "@/components/landing/LandingCta";
import { LandingDevExperience } from "@/components/landing/LandingDevExperience";
import { LandingPricing } from "@/components/landing/LandingPricing";

export function LandingClosing() {
  return (
    <>
      <LandingDevExperience />
      <LandingPricing />
      <LandingCta />
    </>
  );
}
