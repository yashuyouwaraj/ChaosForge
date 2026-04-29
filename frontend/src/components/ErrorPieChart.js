"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#e9724d", "#72BAA9", "#3b82f6"];

export default function ErrorPieChart({ errorTypes }) {
  const data = Object.entries(errorTypes || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl mt-6">
      <h2>🥧 Error Types</h2>

      {total === 0 ? (
        <div className="text-sm text-gray-300 mt-4">
          No error data available yet.
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            display: "block",
            width: "100%",
            height: 300,
            minWidth: 0,
            minHeight: 300,
          }}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                paddingAngle={4}
                cornerRadius={8}
                isAnimationActive={true}
              >
                {data.map((_, i) => (
                  <Cell key={`slice-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
