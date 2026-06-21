import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { CONTACT_EMAIL } from "@/data/landing";

export const metadata = {
  title: "Terms of Service — ChaosForge",
  description: "ChaosForge terms of service.",
};

export default function TermsPage() {
  return (
    <MarketingPageShell
      eyebrow="Legal"
      title="Terms of Service"
      description="Terms governing use of the ChaosForge platform."
    >
      <p>
        By using ChaosForge, you agree to use the platform responsibly. Load testing
        and chaos engineering features must only be used against services you own or
        have explicit permission to test.
      </p>
      <p>
        Free and paid plans are subject to usage limits defined in your subscription
        tier. Enterprise features require an active Enterprise plan.
      </p>
      <p>
        ChaosForge is provided as-is for infrastructure testing and operational
        intelligence. For questions, contact{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:text-cyan-300">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </MarketingPageShell>
  );
}
