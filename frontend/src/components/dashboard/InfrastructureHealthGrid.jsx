"use client";

import { useInfrastructureHealth } from "@/hooks/useInfrastructureHealth";

const getStatusColor = (value) => {
  if (typeof value === "number") {
    return "text-cyan-300";
  }

  const normalizedValue = String(value).toLowerCase();

  if (
    normalizedValue === "connected" ||
    normalizedValue === "ok" ||
    normalizedValue === "healthy" ||
    normalizedValue === "active"
  ) {
    return "text-green-400";
  }

  if (
    normalizedValue === "disabled" ||
    normalizedValue === "unknown" ||
    normalizedValue === "n/a"
  ) {
    return "text-amber-300";
  }

  return "text-red-400";
};

const formatValue = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export function InfrastructureHealthGrid() {
  const { health, loading } = useInfrastructureHealth();
  

  const cards = [
    {
      label: "Redis",
      value: health?.redis || "unknown",
    },

    {
      label: "Kafka",
      value: health?.kafka || "unknown",
    },

    {
      label: "WebSockets",
      value: health?.websockets ? "Connected" : "Disconnected",
    },

    {
      label: "Active Runs",
      value: health?.activeRuns ?? 0,
    },

    {
      label: "Memory Usage",
      value: health?.memory?.heapUsed
        ? `${Math.round(health.memory.heapUsed / 1024 / 1024)} MB`
        : "N/A",
    },

    {
      label: "Platform",
      value: health?.platform || "unknown",
    },
  ];

  return (
    <div
      className="
        grid gap-6
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {cards.map((card) => (
        <div
          key={card.label}
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
            {card.label}
          </p>

          <h3
            className={`
              mt-4 text-3xl
              font-black
              ${getStatusColor(card.value)}
            `}
          >
            {loading ? "..." : formatValue(card.value)}
          </h3>
        </div>
      ))}
    </div>
  );
}
