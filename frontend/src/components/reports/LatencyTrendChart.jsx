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
    () => (providedRun ? buildLatencyTrendPoints(providedRun) : null),
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
          setLoadedData(buildLatencyTrendPoints(run));
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
      data-report-chart="latency-trend"
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
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

              <XAxis dataKey="label" stroke="#94a3b8" />

              <YAxis stroke="#94a3b8" />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="avg"
                stroke="#22d3ee"
                strokeWidth={3}
                name="Avg Latency"
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="p95"
                stroke="#f87171"
                strokeWidth={3}
                name="P95 Latency"
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="max"
                stroke="#facc15"
                strokeWidth={2}
                name="Max Latency"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div
            className="
              flex h-full items-center justify-center
              rounded-2xl border border-white/10
              bg-black/20
              text-center text-sm text-slate-300
            "
          >
            Per-request latency telemetry is not available for this run.
          </div>
        )}
      </div>
    </div>
  );
}

function getLatencyTimeline(run) {
  const candidates = [
    run?.latencyTimeline,
    run?.runMetrics?.latencyTimeline,
    run?.rawMetrics?.latencyTimeline,
    run?.metrics?.latencyTimeline,
  ];

  return candidates.find((value) => Array.isArray(value) && value.length > 0) || [];
}

function buildLatencyTrendPoints(run) {
  const timeline = getLatencyTimeline(run)
    .map((point, index) => ({
      time: Number(point.time ?? point.timestamp ?? point.recordedAt),
      latency: Number(point.latency ?? point.value ?? point.duration),
      request: Number(point.request || index + 1),
    }))
    .filter(
      (point) =>
        Number.isFinite(point.time) && Number.isFinite(point.latency),
    )
    .sort((a, b) => a.time - b.time || a.request - b.request);

  if (timeline.length === 0) {
    return [];
  }

  const startedAt = timeline[0].time;
  const endedAt = timeline[timeline.length - 1].time;
  const duration = Math.max(1, endedAt - startedAt);
  const targetBuckets = Math.min(40, Math.max(8, Math.ceil(timeline.length / 25)));
  const bucketSize = Math.max(1000, Math.ceil(duration / targetBuckets));
  const buckets = new Map();

  timeline.forEach((point) => {
    const elapsed = Math.max(0, point.time - startedAt);
    const bucketIndex = Math.floor(elapsed / bucketSize);

    if (!buckets.has(bucketIndex)) {
      buckets.set(bucketIndex, []);
    }

    buckets.get(bucketIndex).push(point.latency);
  });

  return [...buckets.entries()].map(([bucketIndex, latencies]) => {
    const sorted = [...latencies].sort((a, b) => a - b);
    const p95Index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
    const elapsedSeconds = Math.round((bucketIndex * bucketSize) / 1000);
    const avg =
      latencies.reduce((total, latency) => total + latency, 0) /
      latencies.length;

    return {
      label: `${elapsedSeconds}s`,
      avg: Math.round(avg),
      p95: Math.round(sorted[p95Index]),
      max: Math.round(sorted[sorted.length - 1]),
    };
  });
}
