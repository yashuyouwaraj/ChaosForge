import { MarketingPageShell } from "@/components/landing/MarketingPageShell";

export const metadata = {
  title: "Roadmap — ChaosForge",
  description: "ChaosForge product roadmap and future phases.",
};

export default function RoadmapPage() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Realtime Distributed Load Testing",
      status: "Complete",
      items: ["Kafka workers", "WebSocket telemetry", "Live dashboard", "Run comparison"],
    },
    {
      phase: "Phase 2",
      title: "Observability + AI Intelligence",
      status: "Complete",
      items: ["Prometheus + Grafana", "11 intelligence engines", "Operational reports", "PDF/JSON/CSV export"],
    },
    {
      phase: "Phase 3",
      title: "Distributed Infrastructure Intelligence",
      status: "Complete",
      items: ["Infrastructure memory", "Deployment readiness", "Predictive risk", "Executive briefs"],
    },
    {
      phase: "Phase 4",
      title: "Autonomous Infrastructure Operations",
      status: "In Progress",
      items: ["AI copilot skills", "Chaos experiment advisor", "Weekly infrastructure review", "Capacity planning"],
    },
    {
      phase: "Phase 5",
      title: "AI-Native Infrastructure Operating System",
      status: "Planned",
      items: ["Autonomous remediation", "Multi-cluster orchestration", "Advanced model routing", "Enterprise integrations"],
    },
  ];

  return (
    <MarketingPageShell
      eyebrow="Resources"
      title="Product Roadmap"
      description="Five phases toward an AI-native infrastructure operating system."
    >
      <div className="space-y-6">
        {phases.map((phase) => (
          <div key={phase.phase} className="glass rounded-[24px] p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-cyan-400">{phase.phase}</span>
              <span
                className={`rounded-full px-3 py-0.5 text-xs ${
                  phase.status === "Complete"
                    ? "bg-green-400/10 text-green-300"
                    : phase.status === "In Progress"
                      ? "bg-yellow-400/10 text-yellow-300"
                      : "bg-white/[0.05] text-slate-400"
                }`}
              >
                {phase.status}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-bold text-white">{phase.title}</h3>
            <ul className="mt-3 space-y-1 text-sm text-slate-400">
              {phase.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </MarketingPageShell>
  );
}
