"use client";

import {
  ShieldCheck,
  AlertTriangle,
  BrainCircuit,
  Wrench,
  Database,
  TrendingUp,
} from "lucide-react";

import { useIntelligence } from "@/hooks/useIntelligence";

export function AiOperationsOverview({ projectId, runId }) {
  const { intelligence } = useIntelligence(projectId, runId);

  const health = intelligence?.health;
  const risk = intelligence?.risk;
  const rootCause = intelligence?.rootCause || [];
  const recommendations = intelligence?.recommendations || [];
  const memory = intelligence?.infrastructureMemory?.patterns || [];

  const cards = [
    {
      label: "AI Confidence",
      value: `${risk?.confidence || health?.score || 0}%`,
      icon: BrainCircuit,
      color: "text-cyan-300",
    },
    {
      label: "Risk Level",
      value:
        risk?.level && risk.level !== "stable"
          ? risk.level.charAt(0).toUpperCase() + risk.level.slice(1)
          : "Stable",
      icon: ShieldCheck,
      color:
        risk?.level === "stable" || !risk?.level
          ? "text-green-300"
          : "text-yellow-300",
    },
    {
      label: "Anomalies",
      value: rootCause.filter(
        (cause) => cause.title !== "No Dominant Failure Source",
      ).length,
      icon: AlertTriangle,
      color: "text-orange-300",
    },
    {
      label: "Root Causes",
      value: rootCause.length,
      icon: TrendingUp,
      color: "text-red-300",
    },
    {
      label: "Recommendations",
      value: recommendations.length,
      icon: Wrench,
      color: "text-cyan-300",
    },
    {
      label: "Patterns Learned",
      value: memory.length,
      icon: Database,
      color: "text-purple-300",
    },
  ];

  return (
    <div className="glass rounded-[32px] p-8">
      <div>
        <p
          className="
            text-sm uppercase
            tracking-[0.3em]
            text-cyan-400
          "
        >
          AI Command Center
        </p>

        <h2
          className="
            mt-3 text-4xl
            font-black
          "
        >
          AI Operations Overview
        </h2>

        <p
          className="
            mt-4 text-muted-foreground
          "
        >
          Unified intelligence summary generated from anomaly detection,
          predictive forecasting, root cause analysis, remediation workflows and
          infrastructure memory.
        </p>
      </div>

      <div
        className="
          mt-8 grid gap-6
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="
                rounded-[28px]
                border border-white/10
                bg-black/20
                p-6
              "
            >
              <div
                className="
                  flex items-center
                  justify-between
                "
              >
                <Icon
                  className={`
                    h-6 w-6
                    ${card.color}
                  `}
                />

                <span
                  className="
                    text-xs uppercase
                    tracking-[0.2em]
                    text-muted-foreground
                  "
                >
                  LIVE
                </span>
              </div>

              <h3
                className={`
                  mt-6 text-5xl
                  font-black
                  ${card.color}
                `}
              >
                {card.value}
              </h3>

              <p
                className="
                  mt-3 text-muted-foreground
                "
              >
                {card.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
