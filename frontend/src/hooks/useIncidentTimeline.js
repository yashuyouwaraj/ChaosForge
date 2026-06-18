"use client";

import { useEffect, useState } from "react";

import socket, { ensureSocketConnected } from "@/lib/socket";
import { api } from "@/lib/api";

export function useIncidentTimeline({ enabled = true } = {}) {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (!enabled) {
      setTimeline([]);
      return undefined;
    }

    let ignore = false;

    const handler = (incidents) => {
      setTimeline(incidents || []);
    };

    const loadTimeline = async () => {
      try {
        const health = await api("/health");

        if (!ignore) {
          setTimeline(health.incidentTimeline || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadTimeline();

    ensureSocketConnected();
    socket.on("incident-timeline", handler);

    return () => {
      ignore = true;

      socket.off("incident-timeline", handler);
    };
  }, [enabled]);

  return timeline;
}
