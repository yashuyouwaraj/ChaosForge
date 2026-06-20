"use client";

export function ChaosMetricCard({ title, value, unit = "" }) {
  return (
    <div
      className="
      glass rounded-2xl
      border border-white/10
      p-5
    "
    >
      <p className="text-sm text-muted-foreground">{title}</p>

      <h3 className="mt-3 text-3xl font-black">
        {value}
        <span className="ml-1 text-lg">{unit}</span>
      </h3>
    </div>
  );
}
