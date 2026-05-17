"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { useProject } from "@/components/providers/ProjectProvider";

const COMPLETED_RUN_STATUSES = new Set(["completed"]);

const FAILED_RUN_STATUSES = new Set(["failed", "stopped"]);

const isCompletedRun = (run) => COMPLETED_RUN_STATUSES.has(run?.status);

const isFailedRun = (run) => FAILED_RUN_STATUSES.has(run?.status);

export function usePlatformOverview() {
  const { projectId } = useProject();

  const [selectedProjectName, setSelectedProjectName] = useState("");

  const [totalRuns, setTotalRuns] = useState(0);

  const [completedRuns, setCompletedRuns] = useState(0);

  const [failedRuns, setFailedRuns] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!projectId) {
        setSelectedProjectName("");
        setTotalRuns(0);
        setCompletedRuns(0);
        setFailedRuns(0);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        const [projectData, runData] = await Promise.all([
          api("/projects"),
          api(`/runs/${projectId}`),
        ]);

        const nextProjects = Array.isArray(projectData) ? projectData : [];
        const selectedProject = nextProjects.find(
          (project) => project._id === projectId,
        );
        const nextRuns = Array.isArray(runData) ? runData : [];

        if (ignore) {
          return;
        }

        setSelectedProjectName(selectedProject?.name || "Selected Project");
        setTotalRuns(nextRuns.length);
        setCompletedRuns(nextRuns.filter(isCompletedRun).length);
        setFailedRuns(nextRuns.filter(isFailedRun).length);
        setError(null);
      } catch (err) {
        if (!ignore) {
          setSelectedProjectName("Selected Project");
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
  }, [projectId]);

  return useMemo(
    () => ({
      selectedProjectName,

      totalRuns,

      completedRuns,

      failedRuns,

      loading,

      error,
    }),

    [
      selectedProjectName,
      totalRuns,
      completedRuns,
      failedRuns,
      loading,
      error,
    ],
  );
}
