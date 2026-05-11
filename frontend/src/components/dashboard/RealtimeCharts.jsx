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

export function RealtimeCharts() {
  const history =
    useMetricsHistory(
      "demo-project",
      "demo-run",
    );

  const rpsData =
    history.map((point) => ({
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

      latency:
        point.latency,
    }));

  const latest =
    history[
      history.length - 1
    ];

  const errorData = [
    {
      name: "Failures",
      value:
        latest?.failures || 0,
    },

    {
      name: "Healthy",
      value:
        Math.max(
          0,
          100 -
            (
              latest?.failures || 0
            ),
        ),
    },
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
          data={errorData}
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