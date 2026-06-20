"use client";

import { useCallback, useEffect, useState } from "react";

import { useProject } from "@/components/providers/ProjectProvider";
import { getChaosSettings } from "@/lib/chaos";

export function useChaosSettings(projectIdOverride) {
  const project = useProject();
  const projectId = projectIdOverride ?? project?.projectId ?? null;
  const [chaos, setChaos] = useState(null);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!projectId) {
      setChaos(null);
      setError("");
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getChaosSettings(projectId);
      setChaos(data);
      return data;
    } catch (err) {
      setChaos(null);
      setError(err.message || "Unable to load Chaos configuration.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let active = true;

    if (!projectId) {
      queueMicrotask(() => {
        if (active) {
          setChaos(null);
          setError("");
          setLoading(false);
        }
      });

      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");

    getChaosSettings(projectId)
      .then((data) => {
        if (active) {
          setChaos(data);
        }
      })
      .catch((err) => {
        if (active) {
          setChaos(null);
          setError(err.message || "Unable to load Chaos configuration.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  return {
    projectId,
    chaos,
    setChaos,
    loading,
    error,
    refresh,
  };
}
