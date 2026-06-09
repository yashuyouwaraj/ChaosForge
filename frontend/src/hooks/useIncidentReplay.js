"use client";

import { useMemo } from "react";

import { useIncidentTimeline } from "@/hooks/useIncidentTimeline";

export function useIncidentReplay() {
  const timeline = useIncidentTimeline();

  const replayFrames = useMemo(() => {
    if (!Array.isArray(timeline) || timeline.length === 0) {
      return [];
    }

    return [...timeline]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((incident, index) => ({
        id: incident.id ?? `incident-${index}`,

        step: index + 1,

        title: incident.title ?? "Unknown Incident",

        type: incident.type ?? "unknown",

        severity: incident.severity ?? "info",

        timestamp: incident.timestamp ?? new Date().toISOString(),

        message: incident.message ?? "No details available",
      }));
  }, [timeline]);

  return replayFrames;
}
