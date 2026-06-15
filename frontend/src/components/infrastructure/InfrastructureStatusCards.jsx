"use client";


import { usePlatform } from "@/components/providers/PlatformProvider";
import { InfraStatusCard } from "./InfraStatusCard";

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

  const { loading, infrastructureSummary } =
    infrastructure || {};

  const valueOrLoading = (value) =>
    loading ? "..." : value;

  const cards = [
    {
      title: "Overall Health",
      description: "Platform Health Status",
      status:
        infrastructureSummary?.overall ||
        "warning",
      value: valueOrLoading(
        formatStatus(
          infrastructureSummary?.overall,
        ),
      ),
    },

    {
      title: "Redis",
      description: "Control Plane Cache",
      status: normalizeStatus(
        infrastructureSummary?.services
          ?.redis,
      ),
      value: valueOrLoading(
        formatStatus(
          infrastructureSummary?.services
            ?.redis,
        ),
      ),
    },

    {
      title: "Kafka",
      description: "Message Broker",
      status: normalizeStatus(
        infrastructureSummary?.services
          ?.kafka,
      ),
      value: valueOrLoading(
        formatStatus(
          infrastructureSummary?.services
            ?.kafka,
        ),
      ),
    },

    {
      title: "Grafana",
      description: "Visualization Layer",
      status: normalizeStatus(
        infrastructureSummary?.services
          ?.grafana,
      ),
      value: valueOrLoading(
        formatStatus(
          infrastructureSummary?.services
            ?.grafana,
        ),
      ),
    },

    {
      title: "Prometheus",
      description: "Metrics Engine",
      status: normalizeStatus(
        infrastructureSummary?.services
          ?.prometheus,
      ),
      value: valueOrLoading(
        formatStatus(
          infrastructureSummary?.services
            ?.prometheus,
        ),
      ),
    },

    {
      title: "WebSockets",
      description:
        "Realtime Communication",
      status:
        infrastructureSummary?.websocketClients >
        0
          ? "healthy"
          : "warning",
      value: valueOrLoading(
        infrastructureSummary?.websocketClients >
          0
          ? "Connected"
          : "Disconnected",
      ),
    },
  ];

  return (
    <div
      className="
        grid gap-6
        sm:grid-cols-2
        2xl:grid-cols-3
      "
    >
      {cards.map((card) => (
        <InfraStatusCard
          key={card.title}
          title={card.title}
          description={card.description}
          status={card.status}
          value={card.value}
        />
      ))}
    </div>
  );
}