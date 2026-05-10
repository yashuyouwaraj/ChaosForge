"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import ChartFrame from "./ChartFrame";

const COLORS = ["#003f5c", "#434e8a", "#94519e", "#dd4e8b", "#ff6b5a"];

export default function DistributionChart({ buckets }) {
  const data = Object.entries(buckets || {}).map(([range, value]) => ({
    range,
    value,
  }));

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl mt-6">
      <h2>📊 Latency Distribution</h2>

      <ChartFrame height={250}>
        <BarChart data={data}>
          <XAxis dataKey="range" tick={{ fill: "#d1d5db" }} />
          <YAxis tick={{ fill: "#d1d5db" }} />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.08)" }} />
          <Bar dataKey="value" radius={[12, 12, 4, 4]} animationDuration={600}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartFrame>
    </div>
  );
}
