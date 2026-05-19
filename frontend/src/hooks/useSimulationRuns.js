"use client";

import { useCallback, useEffect, useState } from "react";

import { useProject } from "@/components/providers/ProjectProvider";
import { api } from "@/lib/api";

export function useSimulationRuns({ poll = false } = {}) {
  const { projectId } = useProject();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRuns = useCallback(async () => {
    if (!projectId) {
      setRuns([]);
      setError("");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api(`/runs/${projectId}`);
      setRuns(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setRuns([]);
      setError(err.message || "Unable to load simulation runs.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!projectId) {
        setRuns([]);
        setError("");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await api(`/runs/${projectId}`);

        if (!ignore) {
          setRuns(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setRuns([]);
          setError(err.message || "Unable to load simulation runs.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    if (!poll || !projectId) {
      return () => {
        ignore = true;
      };
    }

    const intervalId = window.setInterval(load, 5000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [poll, projectId]);

  return {
    projectId,
    runs,
    loading,
    error,
    refresh: loadRuns,
  };
}
