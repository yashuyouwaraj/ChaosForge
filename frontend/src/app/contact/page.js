import Link from "next/link";

import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { GITHUB_URL, LINKEDIN_URL, PORTFOLIO_URL, CONTACT_EMAIL } from "@/data/landing";

export const metadata = {
  title: "Contact — ChaosForge",
  description: "Get in touch with the ChaosForge team.",
};

export default function ContactPage() {
  return (
    <MarketingPageShell
      eyebrow="Contact"
      title="Get in touch"
      description="Questions about ChaosForge, enterprise plans, or partnerships."
    >
      <p>
        Reach us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:text-cyan-300">
          {CONTACT_EMAIL}
        </a>{" "}
        for sales inquiries, enterprise plans, or technical questions.
      </p>
      <p>
        For open source contributions and bug reports, visit our{" "}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300"
        >
          GitHub repository
        </a>
        . Learn more about the creator on{" "}
        <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
          yashuyouwaraj.vercel.app
        </a>{" "}
        or{" "}
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
          LinkedIn
        </a>
        .
      </p>
      <p>
        Ready to explore the platform?{" "}
        <Link href="/signup" className="text-cyan-400 hover:text-cyan-300">
          Start your free trial
        </Link>{" "}
        or{" "}
        <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300">
          open the dashboard
        </Link>
        .
      </p>
    </MarketingPageShell>
  );
}
