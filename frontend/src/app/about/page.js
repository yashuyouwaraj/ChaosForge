import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LINKEDIN_URL, PERSONAL_GITHUB_URL, PORTFOLIO_URL } from "@/data/landing";

export const metadata = {
  title: "About — ChaosForge",
  description: "Learn about ChaosForge, the AI-native distributed infrastructure intelligence platform.",
};

export default function AboutPage() {
  return (
    <MarketingPageShell
      eyebrow="Company"
      title="About ChaosForge"
      description="ChaosForge is the infrastructure OS for distributed load testing, realtime observability, chaos engineering, and AI-powered operational intelligence."
    >
      <p>
        Built around a control-plane model, ChaosForge lets operators create projects,
        launch distributed traffic simulations via Kafka workers, inject chaos faults,
        monitor live telemetry through WebSockets, and generate executive-ready
        operational reports — all from a single Next.js dashboard.
      </p>
      <p>
        The platform integrates Prometheus, Grafana, Redis, MongoDB, and NVIDIA AI
        to deliver production-style distributed workflow design at a realistic
        portfolio scale.
      </p>
      <p>
        Built by{" "}
        <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
          Yashu Youwaraj
        </a>
        . Connect on{" "}
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
          LinkedIn
        </a>{" "}
        or{" "}
        <a href={PERSONAL_GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
          GitHub
        </a>
        .
      </p>
    </MarketingPageShell>
  );
}
