import MetricsCard from "./MetricsCard";

export default function MetricsGrid({ metrics }) {
  return (
    <div className="grid grid-cols-6 gap-6">
      <MetricsCard
        title="Total Requests"
        value={metrics.totalRequests}
        color="text-white"
      />
      <MetricsCard
        title="Success"
        value={metrics.success}
        color="text-green-400"
      />
      <MetricsCard
        title="Failure"
        value={metrics.failure}
        color="text-red-400"
      />
      <MetricsCard
        title="Avg Latency"
        value={`${metrics.avgLatency} ms`}
        color="text-blue-400"
      />
      <MetricsCard
        title="P95 Latency"
        value={`${metrics.p95Latency} ms`}
        color="text-blue-400"
      />
      <MetricsCard
        title="RPS"
        value={metrics.rps}
        color="text-blue-400"
      />
    </div>
  );
}
