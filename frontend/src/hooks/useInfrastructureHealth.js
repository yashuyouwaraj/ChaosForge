"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";

export const useInfrastructureHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadHealth = async () => {
      try {
        const data = await api("/health");
        if (ignore) {
          return;
        }

        setHealth(data);
        setError(false);
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError(true);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    loadHealth();

    const intervalId = window.setInterval(loadHealth, 5000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const infrastructureSummary = useMemo(() => {
    if (!health) {
      return {
        overall: "unknown",
      };
    }

    const services = [
      health.redis,
      health.kafka,
      health.grafana,
      health.prometheus,
    ];

    const hasError = services.includes("error");

    const hasDisconnected = services.includes("disconnected");

    return {
      overall: hasError ? "critical" : hasDisconnected ? "warning" : "healthy",

      services: {
        redis: health.redis,
        kafka: health.kafka,
        grafana: health.grafana,
        prometheus: health.prometheus,
      },

      websocketClients: health?.websockets?.connectedClients || 0,

      activeRuns: health?.activeRuns || 0,

      workers: health?.kafkaWorkers?.connected || 0,
    };
  }, [health]);

  return {
    health,
    loading,
    error,
    infrastructureSummary,
  };
};
