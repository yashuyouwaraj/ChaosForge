"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";

const COMPLETED_RUN_STATUSES = new Set(["completed"]);

const FAILED_RUN_STATUSES = new Set(["failed", "stopped"]);

const isCompletedRun = (run) => COMPLETED_RUN_STATUSES.has(run?.status);

const isFailedRun = (run) => FAILED_RUN_STATUSES.has(run?.status);

export function usePlatformOverview() {
  const [totalProjects, setTotalProjects] = useState(0);

  const [totalRuns, setTotalRuns] = useState(0);

  const [completedRuns, setCompletedRuns] = useState(0);

  const [failedRuns, setFailedRuns] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const projectData = await api("/projects");
        const nextProjects = Array.isArray(projectData) ? projectData : [];

        const runResults = await Promise.allSettled(
          nextProjects.map((project) => api(`/runs/${project._id}`)),
        );

        const nextRuns = runResults.flatMap((result) => {
          if (result.status !== "fulfilled" || !Array.isArray(result.value)) {
            return [];
          }

          return result.value;
        });

        if (ignore) {
          return;
        }

        setTotalProjects(nextProjects.length);
        setTotalRuns(nextRuns.length);
        setCompletedRuns(nextRuns.filter(isCompletedRun).length);
        setFailedRuns(nextRuns.filter(isFailedRun).length);
        setError(null);
      } catch (err) {
        if (!ignore) {
          setTotalProjects(0);
          setTotalRuns(0);
          setCompletedRuns(0);
          setFailedRuns(0);
          setError(err.message || "Unable to load platform overview.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    const interval = setInterval(load, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  return useMemo(
    () => ({
      totalProjects,

      totalRuns,

      completedRuns,

      failedRuns,

      loading,

      error,
    }),

    [totalProjects, totalRuns, completedRuns, failedRuns, loading, error],
  );
}
