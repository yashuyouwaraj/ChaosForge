"use client";

import { Brain, Sparkles } from "lucide-react";

export function AiOverviewCard() {
  return (
    <div
      className="
        glass rounded-[32px]
        p-10
      "
    >
      <div
        className="
          flex flex-col gap-8
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>
          <p
            className="
              text-sm uppercase
              tracking-[0.3em]
              text-cyan-400
            "
          >
            Artificial Intelligence
          </p>

          <h2
            className="
              mt-4 text-5xl
              font-black
            "
          >
            Infrastructure Intelligence Engine
          </h2>

          <p
            className="
              mt-5 max-w-3xl
              text-lg
              text-muted-foreground
            "
          >
            Autonomous infrastructure intelligence for
            anomaly detection, predictive risk analysis,
            root cause investigation, remediation guidance,
            and operational memory.
          </p>
        </div>

        <div
          className="
            flex items-center gap-4
          "
        >
          <Brain className="h-14 w-14 text-cyan-400" />
          <Sparkles className="h-12 w-12 text-cyan-300" />
        </div>
      </div>
    </div>
  );
}