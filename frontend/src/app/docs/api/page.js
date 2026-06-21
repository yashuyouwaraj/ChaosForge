import { MarketingPageShell } from "@/components/landing/MarketingPageShell";

export const metadata = {
  title: "API Reference — ChaosForge",
  description: "ChaosForge REST API reference and backend endpoints.",
};

export default function ApiDocsPage() {
  return (
    <MarketingPageShell
      eyebrow="Resources"
      title="API Reference"
      description="ChaosForge backend REST API — Express gateway on port 3001."
    >
      <h2 className="text-xl font-bold text-white">Core Endpoints</h2>
      <div className="space-y-4 font-mono text-sm">
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-cyan-400">GET</span> /health — Health check
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-cyan-400">GET</span> /metrics — Prometheus metrics
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-green-400">POST</span> /auth/login — Authentication
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-green-400">POST</span> /auth/signup — Registration
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-cyan-400">GET</span> /projects — List projects
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-green-400">POST</span> /runs/:projectId/start — Start simulation
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-cyan-400">GET</span> /chaos/:projectId — Chaos settings
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-green-400">POST</span> /ai/chat — AI copilot chat
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-cyan-400">GET</span> /report/json/:projectId/:runId — JSON report
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-cyan-400">GET</span> /report/csv/:projectId/:runId — CSV report
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <span className="text-cyan-400">GET</span> /report/pdf/:projectId/:runId — PDF report
        </div>
      </div>

      <p className="mt-8">
        Full architecture and setup documentation is available in the project README on{" "}
        <a
          href="https://github.com/yashuyouwaraj/ChaosForge"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300"
        >
          GitHub
        </a>
        . WebSocket events are delivered via Socket.IO on the backend gateway.
      </p>
    </MarketingPageShell>
  );
}
