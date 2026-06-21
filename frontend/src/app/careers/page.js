import { MarketingPageShell } from "@/components/landing/MarketingPageShell";

export const metadata = {
  title: "Careers — ChaosForge",
  description: "Join the ChaosForge team building AI-native infrastructure intelligence.",
};

export default function CareersPage() {
  return (
    <MarketingPageShell
      eyebrow="Company"
      title="Careers"
      description="Help us build the next generation of resilient infrastructure tooling."
    >
      <p>
        ChaosForge is an open-source infrastructure intelligence platform. We are
        building tools for distributed load testing, chaos engineering, and
        AI-powered operational analysis.
      </p>
      <p>
        Career opportunities will be posted here as the project grows. For now, we
        welcome contributions through our GitHub repository.
      </p>
    </MarketingPageShell>
  );
}
