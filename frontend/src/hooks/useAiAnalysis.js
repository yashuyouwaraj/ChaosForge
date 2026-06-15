"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

export function useAiAnalysis(projectId, runId) {
  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId || !runId) {
      return;
    }

    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await api(`/api/ai/${projectId}/${runId}`);

        if (!ignore) {
          setAnalysis(result);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load AI analysis");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [projectId, runId]);

  return {
    analysis,
    loading,
    error,
  };
}
