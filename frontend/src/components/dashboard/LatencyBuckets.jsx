"use client";

import { useEffect, useMemo, useState } from "react";

import { useRun } from "@/components/providers/RunProvider";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";
import { api } from "@/lib/api";

const BUCKETS = [
  {
    key: "0-500",
    label: "0-500ms",
    tone: "bg-emerald-400",
    border: "border-emerald-400/20",
    text: "text-emerald-300",
  },
  {
    key: "500-1000",
    label: "500-1000ms",
    tone: "bg-cyan-400",
    border: "border-cyan-400/20",
    text: "text-cyan-300",
  },
  {
    key: "1000-2000",
    label: "1000-2000ms",
    tone: "bg-yellow-400",
    border: "border-yellow-400/20",
    text: "text-yellow-300",
  },
  {
    key: "2000+",
    label: "2000ms+",
    tone: "bg-red-400",
    border: "border-red-400/20",
    text: "text-red-300",
  },
];

const EMPTY_BUCKETS = {
  "0-500": 0,
  "500-1000": 0,
  "1000-2000": 0,
  "2000+": 0,
};

export function LatencyBuckets() {
  const { selectedRun } = useRun();
  const liveMetrics = useRealtimeMetrics(
    selectedRun.projectId,
    selectedRun.runId,
  );
  const [fetchedMetrics, setFetchedMetrics] = useState(null);

  useEffect(() => {
    if (
      !selectedRun.projectId ||
      !selectedRun.runId ||
      !selectedRun.isActive
    ) {
      return;
    }

    let ignore = false;

    const loadMetrics = async () => {
      try {
        const data = await api(
          `/metrics/${selectedRun.projectId}?runId=${selectedRun.runId}`,
        );

        if (!ignore) {
          setFetchedMetrics(data);
        }
      } catch {
        if (!ignore) {
          setFetchedMetrics(null);
        }
      }
    };

    loadMetrics();

    const intervalId = window.setInterval(loadMetrics, 5000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [
    selectedRun.projectId,
    selectedRun.runId,
    selectedRun.isActive,
  ]);

  const metrics = selectedRun.isActive && selectedRun.runId
    ? liveMetrics || fetchedMetrics
    : null;

  const bucketData = useMemo(() => {
    const buckets = metrics?.latencyBuckets || EMPTY_BUCKETS;
    const total = BUCKETS.reduce(
      (sum, bucket) => sum + Number(buckets[bucket.key] || 0),
      0,
    );

    return BUCKETS.map((bucket) => {
      const value = Number(buckets[bucket.key] || 0);
      const percent = total > 0 ? Math.round((value / total) * 100) : 0;

      return {
        ...bucket,
        value,
        percent,
      };
    });
  }, [metrics]);

  const totalRequests = bucketData.reduce(
    (sum, bucket) => sum + bucket.value,
    0,
  );

  return (
    <div
      className="
        glass rounded-[28px]
        p-6
      "
    >
      <div
        className="
          flex flex-wrap items-start
          justify-between gap-4
        "
      >
        <div>
          <h3 className="text-2xl font-bold">
            Latency Buckets
          </h3>

          <p className="text-muted-foreground">
            Request distribution across response-time bands.
          </p>
        </div>

        <div
          className="
            rounded-2xl border border-white/10
            bg-black/20 px-5 py-3
            text-right
          "
        >
          <p
            className="
              text-xs uppercase
              tracking-[0.2em]
              text-muted-foreground
            "
          >
            Bucketed
          </p>

          <p className="mt-1 text-2xl font-black">
            {totalRequests}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {bucketData.map((bucket) => (
          <div
            key={bucket.key}
            className={`
              rounded-2xl border bg-black/20
              p-4
              ${bucket.border}
            `}
          >
            <div
              className="
                flex items-center
                justify-between gap-3
              "
            >
              <span className="text-sm font-medium">
                {bucket.label}
              </span>

              <span
                className={`
                  text-sm font-semibold
                  ${bucket.text}
                `}
              >
                {bucket.percent}%
              </span>
            </div>

            <div
              className="
                mt-4 h-2 overflow-hidden
                rounded-full bg-white/10
              "
            >
              <div
                className={`
                  h-full rounded-full
                  ${bucket.tone}
                `}
                style={{
                  width: `${bucket.percent}%`,
                }}
              />
            </div>

            <p
              className="
                mt-4 text-3xl
                font-black
              "
            >
              {bucket.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
