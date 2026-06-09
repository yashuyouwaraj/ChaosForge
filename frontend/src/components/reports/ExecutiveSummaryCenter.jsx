"use client";

import { FileText } from "lucide-react";

import { useExecutiveSummary } from "@/hooks/useExecutiveSummary";

export function ExecutiveSummaryCenter({ projectId, runId }) {
  const summary = useExecutiveSummary(projectId, runId);

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
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
            Executive Summary
          </h2>

          <p
            className="
              mt-3 text-muted-foreground
            "
          >
            AI-generated operational overview of this execution.
          </p>
        </div>

        <FileText
          className="
            h-8 w-8
            text-cyan-400
          "
        />
      </div>

      <div
        className="
          mt-8 rounded-[24px]
          border border-cyan-500/20
          bg-cyan-500/5
          p-6
        "
      >
        <p
          className="
            text-sm uppercase
            tracking-[0.2em]
            text-cyan-300
          "
        >
          Status
        </p>

        <h3
          className="
            mt-3 text-3xl
            font-black
          "
        >
          {summary.status}
        </h3>

        <p
          className="
            mt-4 text-slate-300
            leading-8
          "
        >
          {summary.headline}
        </p>
      </div>

      <div
        className="
          mt-8
        "
      >
        <h4
          className="
            text-lg font-bold
          "
        >
          Key Findings
        </h4>

        <ul
          className="
            mt-4 space-y-3
          "
        >
          {summary.findings.map((finding, index) => (
            <li
              key={index}
              className="
                  rounded-xl
                  border border-white/10
                  bg-white/5
                  px-4 py-3
                "
            >
              • {finding}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
