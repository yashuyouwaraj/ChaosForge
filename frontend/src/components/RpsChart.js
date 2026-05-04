"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartFrame from "./ChartFrame";

export default function RpsChart({ data }) {
  const orderedData = [...(data || [])].sort((a, b) => {
    return (a.timestamp || 0) - (b.timestamp || 0);
  });

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mt-6">
      <h2 className="mb-4 text-lg">Requests/sec Over Time</h2>
      {orderedData.length > 0 ? (
        <ChartFrame height={300}>
          <LineChart data={orderedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="elapsedSec"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => `${value}s`}
              minTickGap={24}
              tick={{ fill: "#d1d5db", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#d1d5db", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${value} req/s`, "Requests/sec"]}
              labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload;
                return point ? `${point.elapsedSec}s (${point.time})` : "";
              }}
            />
            <Line
              type="monotone"
              dataKey="rps"
              name="Requests/sec"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartFrame>
      ) : (
        <div className="text-sm text-gray-500">Waiting for RPS data...</div>
      )}
    </div>
  );
}
