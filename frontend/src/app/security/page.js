import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { CONTACT_EMAIL } from "@/data/landing";

export const metadata = {
  title: "Security — ChaosForge",
  description: "ChaosForge security practices and infrastructure.",
};

export default function SecurityPage() {
  return (
    <MarketingPageShell
      eyebrow="Legal"
      title="Security"
      description="How ChaosForge protects your infrastructure data."
    >
      <p>
        Authentication uses JWT tokens with secure session management. API routes are
        protected by auth middleware. Passwords are hashed before storage.
      </p>
      <p>
        The platform runs on Docker Compose with isolated service profiles. Redis
        handles ephemeral runtime state, MongoDB stores persistent data, and Kafka
        provides durable event streaming between API and workers.
      </p>
      <p>
        AI requests are routed through the NVIDIA NIM provider with configurable
        model selection. AI response caching uses Redis with TTL-based expiration.
      </p>
      <p>
        Report security concerns to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:text-cyan-300">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </MarketingPageShell>
  );
}
