"use client";

import { useMemo }
  from "react";

import socket
  from "@/lib/socket";

import {
  useRun,
} from "@/components/providers/RunProvider";

import {
  usePlatform,
} from "@/components/providers/PlatformProvider";

export function usePlatformStatus() {
  const {
    selectedRun,
  } = useRun();

  const {
    infrastructure,
    incidents,
  } = usePlatform();

  const {
    infrastructureSummary,
  } = infrastructure;

  return useMemo(
    () => ({
      websocket:
        socket.connected,

      simulation:
        Boolean(
          selectedRun?.isActive,
        ),

      runId:
        selectedRun?.runId,

      runStatus:
        selectedRun?.status,

      observability:
        infrastructureSummary
          ?.services
          ?.grafana ===
          "connected" &&
        infrastructureSummary
          ?.services
          ?.prometheus ===
          "connected",

      infrastructure:
        infrastructureSummary
          ?.overall ===
        "healthy",

      activeIncidents:
        incidents?.filter(
          (incident) =>
            incident.severity ===
              "critical" ||
            incident.severity ===
              "warning",
        ).length || 0,
    }),

    [
      selectedRun,
      infrastructureSummary,
      incidents,
    ],
  );
}