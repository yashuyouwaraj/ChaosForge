"use client";

import { useEffect, useState } from "react";

import { loadRunDetails } from "./reportData";

const getIntensity = (value) => {
  if (value >= 100) {
    return `
      bg-red-500/30
      border-red-500/40
      text-red-300
    `;
  }

  if (value >= 50) {
    return `
      bg-yellow-500/20
      border-yellow-500/30
      text-yellow-300
    `;
  }

  if (value > 0) {
    return `
      bg-cyan-500/10
      border-cyan-500/20
      text-cyan-300
    `;
  }

  return `
    bg-white/[0.02]
    border-white/5
    text-slate-500
  `;
};

export function FailureHeatmap({ run: providedRun, runId }) {
  const [loadedRun, setLoadedRun] = useState(null);
  const run = providedRun || loadedRun;

  useEffect(() => {
    if (providedRun || !runId) {
      return;
    }

    let ignore = false;

    const load = async () => {
      try {
        const data = await loadRunDetails(runId);

        if (!ignore) {
          setLoadedRun(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [providedRun, runId]);

  if (!run) {
    return null;
  }

  const errors = run.errorTypes || {};

  const heatmap = [
    {
      label: "Timeout Failures",

      value: errors.timeout || 0,
    },

    {
      label: "Network Failures",

      value: errors.network || 0,
    },

    {
      label: "Server Failures",

      value: errors.server || 0,
    },

    {
      label: "Distributed Queue Pressure",

      value: Math.round((run.failure || 0) * 0.7),
    },

    {
      label: "Worker Instability",

      value: Math.round((run.p95Latency || 0) / 20),
    },

    {
      label: "Traffic Saturation",

      value: Math.round((run.rps || 0) / 10),
    },
  ];

  return (
    <div
      data-report-chart="failure-heatmap"
      className="
        glass rounded-[32px]
        p-8
      "
    >
      <div className="mb-8">
        <h3
          className="
            text-3xl font-black
          "
        >
          Failure Heatmap
        </h3>

        <p
          className="
            mt-3 text-muted-foreground
          "
        >
          Operational failure concentration across distributed infrastructure
          systems.
        </p>
      </div>

      <div
        className="
          grid gap-5
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {heatmap.map((item) => (
          <div
            key={item.label}
            className={`
                rounded-2xl
                border p-6
                transition-all
                duration-300
                ${getIntensity(item.value)}
              `}
          >
            <p
              className="
                  text-sm uppercase
                  tracking-[0.2em]
                "
            >
              {item.label}
            </p>

            <h3
              className="
                  mt-5 text-5xl
                  font-black
                "
            >
              {item.value}
            </h3>

            <div
              className="
                  mt-5 h-2
                  overflow-hidden
                  rounded-full
                  bg-black/30
                "
            >
              <div
                className="
                    h-full rounded-full
                    bg-current
                  "
                style={{
                  width: `${Math.min(item.value, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
