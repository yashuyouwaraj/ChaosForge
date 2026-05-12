"use client";

import { motion } from "framer-motion";

import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";

import { useRun } from "@/components/providers/RunProvider";

export function RealtimeTelemetry() {
  const { selectedRun } = useRun();

  const metrics = useRealtimeMetrics(selectedRun.projectId, selectedRun.runId);

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
      value : metrics?.p95Latency || 0
    },
    {
      label: "RPS",
      value : metrics?.rps || 0
    }
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
