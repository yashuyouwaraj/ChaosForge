"use client";

import RpsChart
  from "@/components/charts/RpsChart";

import MetricsChart
  from "@/components/charts/MetricsChart";

import ErrorPieChart
  from "@/components/charts/ErrorPieChart";

import {
  useMetricsHistory,
} from "@/hooks/useMetricsHistory";
import {
  useRun,
} from "@/components/providers/RunProvider";

export function RealtimeCharts() {
  const { selectedRun } =
    useRun();

  const history =
    useMetricsHistory(
      selectedRun.projectId,
      selectedRun.runId,
      selectedRun.isActive,
    );

  const rpsData =
    history.map((point) => ({
      timestamp:
        point.timestamp,
      elapsedSec:
        point.elapsedSec,
      time:
        new Date(
          point.timestamp,
        ).toLocaleTimeString(),
      rps: point.rps,
    }));

  const latencyData =
    history.map((point) => ({
      time:
        new Date(
          point.timestamp,
        ).toLocaleTimeString(),
      avgLatency:
        point.avgLatency,
      p95Latency:
        point.p95Latency,
    }));

  const latest =
    history[
      history.length - 1
    ];

  return (
    <div
      className="
        grid gap-6
        xl:grid-cols-3
      "
    >
      {/* RPS */}
      <div
        className="
          glass rounded-[28px]
          p-6 xl:col-span-2
        "
      >
        <div className="mb-6">
          <h3 className="text-2xl font-bold">
            Request Throughput
          </h3>

          <p className="text-muted-foreground">
            Live requests per second telemetry.
          </p>
        </div>

        <RpsChart data={rpsData} />
      </div>

      {/* ERRORS */}
      <div
        className="
          glass rounded-[28px]
          p-6
        "
      >
        <div className="mb-6">
          <h3 className="text-2xl font-bold">
            Failure Distribution
          </h3>

          <p className="text-muted-foreground">
            Error analytics stream.
          </p>
        </div>

        <ErrorPieChart
          errorTypes={
            latest?.errorTypes
          }
        />
      </div>

      {/* LATENCY */}
      <div
        className="
          glass rounded-[28px]
          p-6 xl:col-span-3
        "
      >
        <div className="mb-6">
          <h3 className="text-2xl font-bold">
            Latency Intelligence
          </h3>

          <p className="text-muted-foreground">
            Distributed latency analysis.
          </p>
        </div>

        <MetricsChart
          data={latencyData}
        />
      </div>
    </div>
  );
}
