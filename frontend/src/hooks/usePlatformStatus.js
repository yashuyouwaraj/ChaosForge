"use client";

import { useMemo }
  from "react";

import socket
  from "@/lib/socket";

import {
  useRun,
} from "@/components/providers/RunProvider";

export function usePlatformStatus() {
  const { selectedRun } =
    useRun();

  return useMemo(
    () => ({
      websocket:
        socket.connected,

      simulation:
        Boolean(selectedRun?.isActive),

      runId:
        selectedRun?.runId,

      runStatus:
        selectedRun?.status,

      observability: true,
    }),

    [selectedRun],
  );
}
