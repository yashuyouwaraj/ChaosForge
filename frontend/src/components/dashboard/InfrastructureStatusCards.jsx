"use client";

import { InfraStatusCard } from "@/components/dashboard/InfraStatusCard";
import { usePlatform } from "@/components/providers/PlatformProvider";
import { useInfrastructureHealth } from "@/hooks/useInfrastructureHealth";

const formatStatus = (value) => {
  if (!value) {
    return "Unknown";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const normalizeStatus = (status) => {
  if (status === "connected") {
    return "healthy";
  }

  if (status === "disabled") {
    return "warning";
  }

  if (status === "error") {
    return "critical";
  }

  return "warning";
};

export function InfrastructureStatusCards() {
  const { infrastructure } = usePlatform();

  const { loading, infrastructureSummary } = infrastructure || {};

  const valueOrLoading = (value) => (loading ? "..." : value);

  return (
    <div
      className="
        grid gap-6
        sm:grid-cols-2
        2xl:grid-cols-3
      "
    >
      {/* OVERALL HEALTH */}

      <InfraStatusCard
        title="Overall Health"
        status={infrastructureSummary?.overall || "warning"}
        value={valueOrLoading(formatStatus(infrastructureSummary?.overall))}
      />

      {/* REDIS */}

      <InfraStatusCard
        title="Redis"
        status={normalizeStatus(infrastructureSummary?.services?.redis)}
        value={valueOrLoading(
          formatStatus(infrastructureSummary?.services?.redis),
        )}
      />

      {/* KAFKA */}

      <InfraStatusCard
        title="Kafka"
        status={normalizeStatus(infrastructureSummary?.services?.kafka)}
        value={valueOrLoading(
          formatStatus(infrastructureSummary?.services?.kafka),
        )}
      />

      {/* GRAFANA */}

      <InfraStatusCard
        title="Grafana"
        status={normalizeStatus(infrastructureSummary?.services?.grafana)}
        value={valueOrLoading(
          formatStatus(infrastructureSummary?.services?.grafana),
        )}
      />

      {/* PROMETHEUS */}

      <InfraStatusCard
        title="Prometheus"
        status={normalizeStatus(infrastructureSummary?.services?.prometheus)}
        value={valueOrLoading(
          formatStatus(infrastructureSummary?.services?.prometheus),
        )}
      />

      {/* WEBSOCKETS */}

      <InfraStatusCard
        title="WebSocket Clients"
        status={
          infrastructureSummary?.websocketClients > 0 ? "healthy" : "warning"
        }
        value={valueOrLoading(
          infrastructureSummary?.websocketClients > 0
            ? "Connected"
            : "Disconnected",
        )}
      />
    </div>
  );
}
