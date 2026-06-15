"use client";

import { Activity } from "lucide-react";

import { useHealthScore } from "@/hooks/useHealthScore";

const STATUS_STYLES = {
  Excellent: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    text: "text-emerald-300",
  },

  Good: {
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
    text: "text-cyan-300",
  },

  Warning: {
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
    text: "text-yellow-300",
  },

  Critical: {
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    text: "text-red-300",
  },
};

export function HealthScoreCenter({ projectId, runId }) {
  const score = useHealthScore(projectId, runId);

  const status =
    score >= 90
      ? "Excellent"
      : score >= 75
        ? "Good"
        : score >= 50
          ? "Warning"
          : "Critical";

  const style = STATUS_STYLES[status];

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
      {/* HEADER */}

      <div
        className="
          flex items-start
          justify-between
          gap-6
        "
      >
        <div>
          <h2
            className="
              text-4xl font-black
            "
          >
            Infrastructure Health
          </h2>

          <p
            className="
              mt-3
              text-muted-foreground
            "
          >
            AI-generated operational health assessment derived from predictive
            analysis, root causes, anomalies and remediation intelligence.
          </p>
        </div>

        <Activity
          className="
            h-8 w-8
            text-cyan-400
          "
        />
      </div>

      {/* SCORE CARD */}

      <div
        className={`
          mt-8 rounded-[28px]
          border p-8
          ${style.border}
          ${style.bg}
        `}
      >
        <div
          className="
            flex flex-wrap
            items-center
            justify-between
            gap-8
          "
        >
          <div>
            <p
              className="
                text-sm uppercase
                tracking-[0.2em]
                text-slate-400
              "
            >
              Health Score
            </p>

            <h2
              className={`
                mt-4 text-7xl
                font-black
                ${style.text}
              `}
            >
              {score}
            </h2>

            <p
              className="
                mt-2 text-slate-400
              "
            >
              out of 100
            </p>
          </div>

          <div
            className="
              text-right
            "
          >
            <p
              className="
                text-sm uppercase
                tracking-[0.2em]
                text-slate-400
              "
            >
              Status
            </p>

            <h3
              className={`
                mt-4 text-4xl
                font-black
                ${style.text}
              `}
            >
              {status}
            </h3>
          </div>
        </div>
      </div>

      {/* HEALTH LEGEND */}

      <div
        className="
          mt-6 grid gap-4
          md:grid-cols-4
        "
      >
        <div
          className="
            rounded-xl
            border border-emerald-500/20
            bg-emerald-500/5
            p-4
          "
        >
          <div
            className="
              text-sm font-bold
              text-emerald-300
            "
          >
            Excellent
          </div>

          <div
            className="
              mt-1 text-xs
              text-slate-400
            "
          >
            90 - 100
          </div>
        </div>

        <div
          className="
            rounded-xl
            border border-cyan-500/20
            bg-cyan-500/5
            p-4
          "
        >
          <div
            className="
              text-sm font-bold
              text-cyan-300
            "
          >
            Good
          </div>

          <div
            className="
              mt-1 text-xs
              text-slate-400
            "
          >
            75 - 89
          </div>
        </div>

        <div
          className="
            rounded-xl
            border border-yellow-500/20
            bg-yellow-500/5
            p-4
          "
        >
          <div
            className="
              text-sm font-bold
              text-yellow-300
            "
          >
            Warning
          </div>

          <div
            className="
              mt-1 text-xs
              text-slate-400
            "
          >
            50 - 74
          </div>
        </div>

        <div
          className="
            rounded-xl
            border border-red-500/20
            bg-red-500/5
            p-4
          "
        >
          <div
            className="
              text-sm font-bold
              text-red-300
            "
          >
            Critical
          </div>

          <div
            className="
              mt-1 text-xs
              text-slate-400
            "
          >
            0 - 49
          </div>
        </div>
      </div>
    </div>
  );
}
