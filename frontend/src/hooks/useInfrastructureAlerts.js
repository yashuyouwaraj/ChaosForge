"use client";

import {
  useEffect,
  useState,
} from "react";

import socket
  from "@/lib/socket";

export function useInfrastructureAlerts() {
  const [alerts, setAlerts] =
    useState([]);

  useEffect(() => {
    const handler = (
      incomingAlerts,
    ) => {
      setAlerts(
        incomingAlerts || [],
      );
    };

    socket.on(
      "infrastructure-alerts",
      handler,
    );

    return () => {
      socket.off(
        "infrastructure-alerts",
        handler,
      );
    };
  }, []);

  return alerts;
}