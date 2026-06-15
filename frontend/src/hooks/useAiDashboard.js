"use client";

import { useEffect, useState } from "react";

import { useProject } from "@/components/providers/ProjectProvider";
import { api } from "@/lib/api";

const DEBUG_AI_DASHBOARD = process.env.NEXT_PUBLIC_DEBUG_AI === "true";
const EMPTY_AI_DASHBOARD = {
  metrics: null,
  incidents: [],
};

export function useAiDashboard() {
  const { projectId } = useProject() || {};

  const [data, setData] = useState(EMPTY_AI_DASHBOARD);

  useEffect(() => {
    if (!projectId) {
      setData(EMPTY_AI_DASHBOARD);
      return;
    }

    let ignore = false;

    const load = async () => {
      const [metricsResult, incidentsResult] = await Promise.allSettled([
        api(`/metrics/${projectId}`),
        api("/api/incidents"),
      ]);

      const metrics =
        metricsResult.status === "fulfilled" ? metricsResult.value : null;
      const incidents =
        incidentsResult.status === "fulfilled" &&
        Array.isArray(incidentsResult.value)
          ? incidentsResult.value
          : [];

      if (DEBUG_AI_DASHBOARD) {
        console.log("ai dashboard metrics", metrics);
        console.log("ai dashboard incidents", incidents);

        if (metricsResult.status === "rejected") {
          console.error("ai dashboard metrics failed", metricsResult.reason);
        }

        if (incidentsResult.status === "rejected") {
          console.error(
            "ai dashboard incidents failed",
            incidentsResult.reason,
          );
        }
      }

      if (!ignore) {
        setData({
          metrics,
          incidents,
        });
      }
    };

    load().catch((err) => {
      if (DEBUG_AI_DASHBOARD) {
        console.error("AI dashboard load failed", err);
      }

      if (!ignore) {
        setData({
          metrics: null,
          incidents: [],
        });
      }
    });

    return () => {
      ignore = true;
    };
  }, [projectId]);

  return data;
}
