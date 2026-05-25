"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { loadRunDetails } from "./reportData";

export function InfrastructureStabilityTimeline({ run: providedRun, runId }) {
  const [loadedData, setLoadedData] = useState([]);
  const providedData = useMemo(
    () => (providedRun ? getStabilityPoints(providedRun) : null),
    [providedRun],
  );
  const data = providedData || loadedData;

  useEffect(() => {
    if (providedRun || !runId) {
      return;
    }

    let ignore = false;

    const load = async () => {
      try {
        const run = await loadRunDetails(runId);

        if (!ignore) {
          setLoadedData(getStabilityPoints(run));
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

  if (data.length === 0) {
    return null;
  }

  return (
    <div
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
          Infrastructure Stability Timeline
        </h3>

        <p
          className="
            mt-3 text-muted-foreground
          "
        >
          Operational stability evolution during distributed simulation
          execution.
        </p>
      </div>

      <div
        className="
          h-[420px]
        "
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="stability" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />

                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

            <XAxis dataKey="phase" stroke="#94a3b8" />

            <YAxis stroke="#94a3b8" domain={[0, 100]} />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="stability"
              stroke="#22d3ee"
              fill="url(#stability)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function getStabilityPoints(run) {
  const failure = Number(run?.failure || 0);
  const p95Latency = Number(run?.p95Latency || 0);
  const avgLatency = Number(run?.avgLatency || 0);

  return [
    {
      phase: "Initialization",
      stability: 95,
    },
    {
      phase: "Traffic Ramp",
      stability: Math.max(70, 100 - failure),
    },
    {
      phase: "Peak Load",
      stability: Math.max(30, 100 - Math.round(p95Latency / 40)),
    },
    {
      phase: "Recovery",
      stability: Math.max(60, 100 - Math.round(avgLatency / 25)),
    },
    {
      phase: "Completion",
      stability: Math.max(75, 100 - Math.round(failure / 2)),
    },
  ];
}
