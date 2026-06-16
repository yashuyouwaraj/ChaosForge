"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";

import { useRun } from "@/components/providers/RunProvider";
import { api } from "@/lib/api";

const hasTelemetry = (metrics) =>
  Boolean(metrics) &&
  (Number(metrics.totalRequests || 0) > 0 ||
    Number(metrics.avgLatency || 0) > 0 ||
    Number(metrics.p95Latency || 0) > 0 ||
    Number(metrics.currentRps || 0) > 0 ||
    Number(metrics.rps || 0) > 0 ||
    Number(metrics.failure || 0) > 0);

export function RealtimeTelemetry() {
  const { selectedRun } = useRun();
  const runKey = `${selectedRun.projectId || ""}:${selectedRun.runId || ""}`;

  const liveMetrics = useRealtimeMetrics(
    selectedRun.projectId,
    selectedRun.runId,
  );
  const [fetchedMetrics, setFetchedMetrics] = useState(null);
  const [displayMetrics, setDisplayMetrics] = useState(null);

  useEffect(() => {
    if (!selectedRun.projectId || !selectedRun.runId) {
      return;
    }

    let ignore = false;

    const loadMetrics = async () => {
      try {
        const data = await api(
          `/metrics/${selectedRun.projectId}?runId=${selectedRun.runId}`,
        );

        if (!ignore) {
          setFetchedMetrics({
            runKey,
            metrics: data,
          });
        }
      } catch {
        if (!ignore) {
          setFetchedMetrics({
            runKey,
            metrics: null,
          });
        }
      }
    };

    loadMetrics();

    // Faster polling (1 second) to catch WebSocket failures
    // This ensures metrics update quickly even if WebSocket is down
    const intervalId = selectedRun.isActive
      ? window.setInterval(loadMetrics, 1000)
      : null;

    return () => {
      ignore = true;

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [
    selectedRun.projectId,
    selectedRun.runId,
    selectedRun.isActive,
    runKey,
  ]);

  const fetchedMetricsForRun = fetchedMetrics?.runKey === runKey
    ? fetchedMetrics.metrics
    : null;
  const nextMetrics = liveMetrics || fetchedMetricsForRun;

  useEffect(() => {
    if (!hasTelemetry(nextMetrics)) {
      return;
    }

    queueMicrotask(() => {
      setDisplayMetrics({
        runKey,
        metrics: nextMetrics,
      });
    });
  }, [nextMetrics, runKey]);

  const displayMetricsForRun = displayMetrics?.runKey === runKey
    ? displayMetrics.metrics
    : null;
  const metrics = displayMetricsForRun || nextMetrics;

  const cards = [
    {
      label: "Requests",
      value: metrics?.totalRequests || 0,
    },

    {
      label: "Avg Latency",
      value: `${metrics?.avgLatency || 0}ms`,
    },

    {
      label: "Current RPS",
      value: metrics?.currentRps || 0,
    },

    {
      label: "Failures",
      value: metrics?.failure || 0,
    },
    {
      label: "P95 Latency",
      value: `${metrics?.p95Latency || 0}ms`,
    },
    {
      label: "RPS",
      value: metrics?.rps || 0,
    },
  ];

  return (
    <div
      className="
        grid gap-6
        md:grid-cols-3
        xl:grid-cols-6
      "
    >
      {cards.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: index * 0.08,
          }}
          className="
            glass rounded-[28px]
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
              mt-5 text-4xl
              font-black
            "
          >
            {metric.value}
          </h3>
        </motion.div>
      ))}
    </div>
  );
}
