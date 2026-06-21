"use client";

import { useEffect } from "react";
import {
  Activity,
  Brain,
  Database,
  Gauge,
  Sparkles,
  Wifi,
} from "lucide-react";

import { useAiStatus } from "@/hooks/useAiCopilot";
import { useIntelligence } from "@/hooks/useIntelligence";
import {
  AiExecutiveSummaryWidget,
  AiHealthSummaryWidget,
  AiOperationalInsightsWidget,
  AiRecommendationsWidget,
  AiRiskSummaryWidget,
} from "./AiDashboardWidgets";

export function AiPlatformStatusBar() {
  const { status, loadStatus } = useAiStatus();

  useEffect(() => {
    loadStatus().catch(() => {});
    const interval = setInterval(() => {
      loadStatus().catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  if (!status) {
    return null;
  }

  const metrics = status.metrics || {};
  const cache = status.cache || {};

  return (
    <div className="glass rounded-[28px] border border-white/10 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-cyan-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
              AI Platform
            </p>
            <h3 className="text-lg font-black">NVIDIA Copilot Status</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusPill
            icon={Sparkles}
            label={status.model || "auto"}
            tone="cyan"
          />
          <StatusPill
            icon={Gauge}
            label={status.mode || "automatic"}
            tone="slate"
          />
          <StatusPill
            icon={Wifi}
            label={status.configured ? "Connected" : "Intelligence Only"}
            tone={status.configured ? "green" : "yellow"}
          />
          <StatusPill
            icon={Database}
            label={`Cache ${cache.hitRatio || 0}%`}
            tone="green"
          />
          <StatusPill
            icon={Activity}
            label={`${metrics.avgResponseTimeMs || 0}ms avg`}
            tone="slate"
          />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ icon: Icon, label, tone }) {
  const tones = {
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-300",
    green: "border-green-500/20 bg-green-500/5 text-green-300",
    yellow: "border-yellow-500/20 bg-yellow-500/5 text-yellow-300",
    slate: "border-white/10 bg-black/20 text-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${tones[tone] || tones.slate}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export function AiDashboardPanel({ projectId, runId }) {
  const { intelligence } = useIntelligence(projectId, runId);

  if (!projectId || !runId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AiPlatformStatusBar />

      <div className="grid gap-6 xl:grid-cols-2">
        <AiHealthSummaryWidget projectId={projectId} runId={runId} />
        <AiRiskSummaryWidget projectId={projectId} runId={runId} />
      </div>

      <AiRecommendationsWidget projectId={projectId} runId={runId} />

      <AiOperationalInsightsWidget projectId={projectId} runId={runId} />

      {intelligence?.confidence != null && (
        <div className="glass rounded-[28px] border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            AI Confidence
          </p>
          <p className="mt-3 text-3xl font-black text-cyan-300">
            {intelligence.confidence ?? intelligence.risk?.confidence ?? "—"}%
          </p>
        </div>
      )}

      <AiExecutiveSummaryWidget projectId={projectId} runId={runId} />
    </div>
  );
}
