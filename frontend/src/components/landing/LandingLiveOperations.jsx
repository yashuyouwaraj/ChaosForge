"use client";

import { LandingArchitecture } from "@/components/landing/LandingArchitecture";
import { LandingDashboardShowcase } from "@/components/landing/LandingDashboardShowcase";

export function LandingLiveOperations() {
  return (
    <>
      <LandingDashboardShowcase />
      <LandingArchitecture />
    </>
  );
}
