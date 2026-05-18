"use client";

import {
  usePlatform,
} from "@/components/providers/PlatformProvider";

const cardStyles = {
  healthy:
    "border-green-400/20 bg-green-400/10 text-green-300",

  warning:
    "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",

  critical:
    "border-red-400/20 bg-red-400/10 text-red-300",
};

function StatusCard({
  label,
  value,
  status,
}) {
  return (
    <div
      className={`
        rounded-2xl border
        p-5
        ${cardStyles[status]}
      `}
    >
      <p
        className="
          text-xs uppercase
          tracking-[0.2em]
        "
      >
        {label}
      </p>

      <h3
        className="
          mt-3 text-2xl
          font-black
        "
      >
        {value}
      </h3>
    </div>
  );
}

export function ObservabilitySummary() {
  const {
    infrastructure,
    incidents,
  } = usePlatform();

  const {
    infrastructureSummary,
    health,
  } = infrastructure;

  const criticalIncidents =
    incidents.filter(
      (incident) =>
        incident.severity ===
        "critical",
    ).length;

  return (
    <div
      className="
        grid gap-6
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      <StatusCard
        label="Grafana"

        value={
          infrastructureSummary
            ?.services
            ?.grafana ||
          "Unknown"
        }

        status={
          infrastructureSummary
            ?.services
            ?.grafana ===
          "connected"
            ? "healthy"
            : "critical"
        }
      />

      <StatusCard
        label="Prometheus"

        value={
          infrastructureSummary
            ?.services
            ?.prometheus ||
          "Unknown"
        }

        status={
          infrastructureSummary
            ?.services
            ?.prometheus ===
          "connected"
            ? "healthy"
            : "critical"
        }
      />

      <StatusCard
        label="Critical Alerts"

        value={
          criticalIncidents
        }

        status={
          criticalIncidents >
          0
            ? "warning"
            : "healthy"
        }
      />

      <StatusCard
        label="WebSocket Clients"

        value={
          infrastructureSummary
            ?.websocketClients ||
          0
        }

        status="healthy"
      />
    </div>
  );
}