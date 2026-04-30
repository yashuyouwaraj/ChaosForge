"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import ChartFrame from "./ChartFrame";

export default function MetricsChart({ data }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mt-6">
      <h2 className="mb-4 text-lg">📈 Latency Over Time</h2>
      {data && data.length > 0 ? (
        <ChartFrame height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="avgLatency"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4, fill: "#8884d8" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="p95Latency"
              stroke="#ff4d4f"
              strokeWidth={2}
              dot={{ r: 4, fill: "#ff4d4f" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartFrame>
      ) : (
        <div className="text-sm text-gray-500">Waiting for latency data...</div>
      )}
    </div>
  );
}
