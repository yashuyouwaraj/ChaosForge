"use client";

import { InfraStatusCard } from "@/components/dashboard/InfraStatusCard";

import {
  useInfrastructureHealth,
} from "@/hooks/useInfrastructureHealth";

const formatStatusValue = (value) => {
  if (!value) {
    return "Unknown";
  }

  return value.charAt(0).toUpperCase() +
    value.slice(1);
};

const getKafkaWorkerCardStatus = (
  kafka,
  workers,
) => {
  if (
    kafka === "connected" &&
    workers > 0
  ) {
    return "healthy";
  }

  if (
    kafka === "connected" ||
    kafka === "disabled" ||
    !kafka
  ) {
    return "warning";
  }

  return "critical";
};

const getGrafanaCardStatus = (grafana) => {
  if (grafana === "connected") {
    return "healthy";
  }

  if (!grafana) {
    return "warning";
  }

  return "critical";
};

const getWebsocketCardStatus = (clients) =>
  clients > 0
    ? "healthy"
    : "warning";

export function InfrastructureStatusCards() {
  const {
    health,
    loading,
  } =
    useInfrastructureHealth();

  const kafka =
    health?.kafka;

  const kafkaWorkers =
    health?.kafkaWorkers
      ?.connected ?? 0;

  const grafana =
    health?.grafana;

  const websocketClients =
    health?.websockets
      ?.connectedClients ?? 0;

  const valueOrLoading = (value) =>
    loading ? "..." : value;

  return (
    <div
      className="
        grid gap-6
        md:grid-cols-2
        xl:grid-cols-4
      "
    >
      <InfraStatusCard
        title="Kafka Workers"
        status={getKafkaWorkerCardStatus(
          kafka,
          kafkaWorkers,
        )}
        value={valueOrLoading(
          kafkaWorkers,
        )}
      />

      <InfraStatusCard
        title="Grafana"
        status={getGrafanaCardStatus(
          grafana,
        )}
        value={valueOrLoading(
          formatStatusValue(grafana),
        )}
      />

      <InfraStatusCard
        title="WebSockets"
        status={getWebsocketCardStatus(
          websocketClients,
        )}
        value={valueOrLoading(
          websocketClients,
        )}
      />

      <InfraStatusCard
        title="Prometheus"
        status={
          health?.status === "ok"
            ? "healthy"
            : "warning"
        }
        value={valueOrLoading(
          health?.status === "ok"
            ? "Active"
            : "Unknown",
        )}
      />
    </div>
  );
}
