import { MarketingPageShell } from "@/components/landing/MarketingPageShell";

export const metadata = {
  title: "Blog — ChaosForge",
  description: "ChaosForge engineering blog — distributed systems, load testing, and AI operations.",
};

export default function BlogPage() {
  return (
    <MarketingPageShell
      eyebrow="Company"
      title="Blog"
      description="Engineering insights on distributed load testing, chaos engineering, and AI-native infrastructure operations."
    >
      <p>
        The ChaosForge blog is coming soon. We will share deep dives on Kafka worker
        coordination, realtime telemetry architecture, intelligence engine design, and
        lessons from building production-style distributed systems.
      </p>
      <p>
        In the meantime, explore the platform or check the open source repository on
        GitHub for architecture documentation.
      </p>
    </MarketingPageShell>
  );
}
