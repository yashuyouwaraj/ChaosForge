"use client";

import {
  useEffect,
  useState,
} from "react";

import socket
  from "@/lib/socket";
import { api }
  from "@/lib/api";

export function useInfrastructureAlerts() {
  const [alerts, setAlerts] =
    useState([]);

  useEffect(() => {
    let ignore = false;

    const handler = (
      incomingAlerts,
    ) => {
      setAlerts(
        incomingAlerts || [],
      );
    };

    const loadAlerts = async () => {
      try {
        const health =
          await api("/health");

        if (!ignore) {
          setAlerts(
            health.alerts || [],
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadAlerts();

    socket.on(
      "infrastructure-alerts",
      handler,
    );

    return () => {
      ignore = true;

      socket.off(
        "infrastructure-alerts",
        handler,
      );
    };
  }, []);

  return alerts;
}
