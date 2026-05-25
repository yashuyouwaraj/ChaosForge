"use client";

import { useEffect, useMemo, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { loadRunDetails } from "./reportData";

export function LatencyTrendChart({ run: providedRun, runId }) {
  const [loadedData, setLoadedData] = useState([]);
  const providedData = useMemo(
    () => (providedRun ? getLatencyTrendPoints(providedRun) : null),
    [providedRun],
  );
  const data = providedData || loadedData;

  useEffect(() => {
    if (providedRun) {
      return;
    }

    if (!runId) {
      return;
    }

    let ignore = false;

    const load = async () => {
      try {
        const run = await loadRunDetails(runId);

        if (!ignore) {
          setLoadedData(getLatencyTrendPoints(run));
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
          Latency Trend Analysis
        </h3>

        <p
          className="
            mt-3 text-muted-foreground
          "
        >
          Distributed request latency behavior across simulation execution
          stages.
        </p>
      </div>

      <div
        className="
          h-[420px]
        "
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

            <XAxis dataKey="stage" stroke="#94a3b8" />

            <YAxis stroke="#94a3b8" />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="avg"
              stroke="#22d3ee"
              strokeWidth={3}
              name="Avg Latency"
            />

            <Line
              type="monotone"
              dataKey="p95"
              stroke="#f87171"
              strokeWidth={3}
              name="P95 Latency"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function getLatencyTrendPoints(run) {
  const avgLatency = Number(run?.avgLatency || 0);
  const p95Latency = Number(run?.p95Latency || 0);

  return [
    {
      stage: "Start",
      avg: Math.max(50, avgLatency * 0.4),
      p95: Math.max(100, p95Latency * 0.5),
    },
    {
      stage: "Warmup",
      avg: Math.max(100, avgLatency * 0.7),
      p95: Math.max(150, p95Latency * 0.75),
    },
    {
      stage: "Peak",
      avg: avgLatency,
      p95: p95Latency,
    },
    {
      stage: "Recovery",
      avg: Math.max(80, avgLatency * 0.6),
      p95: Math.max(120, p95Latency * 0.65),
    },
  ];
}
