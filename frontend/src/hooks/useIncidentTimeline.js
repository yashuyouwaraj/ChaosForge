"use client";

import { useEffect, useState } from "react";

import socket from "@/lib/socket";

export function useIncidentTimeline() {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const handler = (incidents) => {
      setTimeline(incidents || []);
    };

    socket.on("incident-timeline", handler);

    return () => {
      socket.off("incident-timeline", handler);
    };
  }, []);

  return timeline;
}
