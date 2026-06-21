import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { CONTACT_EMAIL } from "@/data/landing";

export const metadata = {
  title: "Privacy Policy — ChaosForge",
  description: "ChaosForge privacy policy.",
};

export default function PrivacyPage() {
  return (
    <MarketingPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="How ChaosForge handles your data."
    >
      <p>
        ChaosForge collects account information (email, name) for authentication and
        stores project configuration, simulation run data, and operational metrics in
        MongoDB. Payment processing is handled by Stripe.
      </p>
      <p>
        AI copilot interactions may be cached in Redis for performance. Intelligence
        engine outputs are stored with run records for report generation.
      </p>
      <p>
        We do not sell personal data. For data deletion requests, contact{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:text-cyan-300">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </MarketingPageShell>
  );
}
