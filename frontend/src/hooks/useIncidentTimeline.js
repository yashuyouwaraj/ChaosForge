"use client";

import { useEffect, useState } from "react";

import socket from "@/lib/socket";
import { api } from "@/lib/api";

export function useIncidentTimeline() {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
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

    socket.on("incident-timeline", handler);

    return () => {
      ignore = true;

      socket.off("incident-timeline", handler);
    };
  }, []);

  return timeline;
}
