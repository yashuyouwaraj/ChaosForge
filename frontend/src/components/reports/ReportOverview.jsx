"use client";

import { useEffect, useState } from "react";

import { loadRunDetails } from "./reportData";

export function ReportOverview({ run: providedRun, runId }) {
  const [loadedRun, setLoadedRun] = useState(null);
  const run = providedRun || loadedRun;

  useEffect(() => {
    if (providedRun || !runId) {
      return;
    }

    let ignore = false;

    const loadRun = async () => {
      try {
        const data = await loadRunDetails(runId);

        if (!ignore) {
          setLoadedRun(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadRun();

    return () => {
      ignore = true;
    };
  }, [providedRun, runId]);

  if (!run) {
    return null;
  }

  const successRate =
    run.totalRequests > 0
      ? ((run.success / run.totalRequests) * 100).toFixed(1)
      : 100;

  const metrics = [
    {
      label: "Total Requests",

      value: run.totalRequests || 0,
    },

    {
      label: "Success Rate",

      value: `${successRate}%`,
    },

    {
      label: "Avg Latency",

      value: `${run.avgLatency || 0}ms`,
    },

    {
      label: "P95 Latency",

      value: `${run.p95Latency || 0}ms`,
    },

    {
      label: "Failures",

      value: run.failure || 0,
    },

    {
      label: "RPS",

      value: run.rps || 0,
    },
  ];

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
      <div className="mb-8">
        <p
          className="
            text-sm uppercase
            tracking-[0.3em]
            text-cyan-400
          "
        >
          Report Overview
        </p>

        <h2
          className="
            mt-4 text-4xl
            font-black
          "
        >
          Run Intelligence
        </h2>

        <p
          className="
            mt-3 font-mono
            text-sm text-muted-foreground
          "
        >
          {runId}
        </p>
      </div>

      <div
        className="
          grid gap-5
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="
                rounded-2xl
                border border-white/10
                bg-black/20
                p-6
              "
          >
            <p
              className="
                  text-sm
                  text-muted-foreground
                "
            >
              {metric.label}
            </p>

            <h3
              className="
                  mt-4 text-3xl
                  font-black
                "
            >
              {metric.value}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
