import Link from "next/link";

import { MarketingPageShell } from "@/components/landing/MarketingPageShell";

export const metadata = {
  title: "Documentation — ChaosForge",
  description: "ChaosForge platform documentation and getting started guide.",
};

export default function DocsPage() {
  return (
    <MarketingPageShell
      eyebrow="Resources"
      title="Documentation"
      description="Getting started with ChaosForge — distributed load testing, chaos engineering, and AI intelligence."
    >
      <h2 className="text-xl font-bold text-white">Quick Start</h2>
      <ol className="list-decimal space-y-2 pl-6">
        <li>Create an account and sign in</li>
        <li>Create a project with your target HTTP service URL</li>
        <li>Configure a simulation with RPS and duration</li>
        <li>Launch traffic and monitor the live dashboard</li>
        <li>Optionally inject chaos faults during the run</li>
        <li>Review AI intelligence and generate operational reports</li>
      </ol>

      <h2 className="mt-8 text-xl font-bold text-white">Platform Sections</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300">
            Dashboard
          </Link>{" "}
          — Live telemetry and run monitoring
        </li>
        <li>
          <Link href="/simulations" className="text-cyan-400 hover:text-cyan-300">
            Simulations
          </Link>{" "}
          — Traffic configuration and launch
        </li>
        <li>
          <Link href="/chaos" className="text-cyan-400 hover:text-cyan-300">
            Chaos Engineering
          </Link>{" "}
          — Fault injection profiles
        </li>
        <li>
          <Link href="/ai" className="text-cyan-400 hover:text-cyan-300">
            AI Operations
          </Link>{" "}
          — Intelligence engine and copilot
        </li>
        <li>
          <Link href="/reports" className="text-cyan-400 hover:text-cyan-300">
            Reports
          </Link>{" "}
          — Operational reports with PDF, JSON, CSV export
        </li>
        <li>
          <Link href="/observability" className="text-cyan-400 hover:text-cyan-300">
            Observability
          </Link>{" "}
          — Prometheus and Grafana integration
        </li>
      </ul>

      <p className="mt-8">
        For API details, see the{" "}
        <Link href="/docs/api" className="text-cyan-400 hover:text-cyan-300">
          API Reference
        </Link>
        .
      </p>
    </MarketingPageShell>
  );
}
