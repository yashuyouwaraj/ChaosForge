"use client";

import { RunOperationalSummary } from "./RunOperationalSummary";

import { ExportActions } from "./ExportActions";

export function ReportSummaryCard({
  run,
}) {
  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
      <div
        className="
          flex flex-col
          gap-8 xl:flex-row
          xl:items-start
          xl:justify-between
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
            {run.projectName}
          </p>

          <h3
            className="
              mt-3 text-3xl
              font-black
            "
          >
            Simulation Report
          </h3>

          <p
            className="
              mt-3 font-mono
              text-sm text-muted-foreground
            "
          >
            {run.runId}
          </p>
        </div>

        <ExportActions run={run} />
      </div>

      <div
        className="
          mt-8 grid gap-5
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <Metric
          label="RPS"
          value={run.rps || 0}
        />

        <Metric
          label="Avg Latency"
          value={`${run.avgLatency || 0}ms`}
        />

        <Metric
          label="Failures"
          value={run.failure || 0}
        />

        <Metric
          label="Success"
          value={run.success || 0}
        />
      </div>

      <div className="mt-8">
        <RunOperationalSummary
          run={run}
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/10
        bg-black/20
        p-5
      "
    >
      <p
        className="
          text-sm
          text-muted-foreground
        "
      >
        {label}
      </p>

      <h4
        className="
          mt-3 text-2xl
          font-black
        "
      >
        {value}
      </h4>
    </div>
  );
}