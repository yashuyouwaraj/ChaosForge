"use client";

import {
  Brain,
  AlertTriangle,
  Activity,
  Database,
  ShieldAlert,
  Wrench,
} from "lucide-react";

const capabilities = [
  {
    title: "Predictive Risk",
    icon: ShieldAlert,
    description:
      "Forecast infrastructure degradation before incidents occur.",
  },

  {
    title: "Root Cause Analysis",
    icon: Brain,
    description:
      "Identify likely infrastructure failure causes.",
  },

  {
    title: "Anomaly Detection",
    icon: AlertTriangle,
    description:
      "Detect unusual behavior across telemetry streams.",
  },

  {
    title: "Operational Insights",
    icon: Activity,
    description:
      "Transform metrics into actionable intelligence.",
  },

  {
    title: "Infrastructure Memory",
    icon: Database,
    description:
      "Persist operational knowledge and incident history.",
  },

  {
    title: "Remediation Guidance",
    icon: Wrench,
    description:
      "Generate recommended recovery actions.",
  },
];

export function AiCapabilities() {
  return (
    <div
      className="
        grid gap-6
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {capabilities.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="
              glass rounded-[28px]
              p-6
            "
          >
            <Icon
              className="
                h-8 w-8
                text-cyan-400
              "
            />

            <h3
              className="
                mt-5 text-xl
                font-bold
              "
            >
              {item.title}
            </h3>

            <p
              className="
                mt-3 text-sm
                text-muted-foreground
              "
            >
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}