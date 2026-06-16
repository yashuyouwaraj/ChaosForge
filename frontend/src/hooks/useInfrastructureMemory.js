"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

export function useInfrastructureMemory(projectId) {
  const [memory, setMemory] = useState([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) {
      setMemory([]);
      setLoading(false);
      setError("");
      return;
    }

    let ignore = false;

    const loadMemory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api(
          `/api/memory/${projectId}`,
        );

        if (!ignore) {
          setMemory(
            Array.isArray(data)
              ? data
              : [],
          );
        }
      } catch (err) {
        console.error(
          "Failed to load infrastructure memory:",
          err,
        );

        if (!ignore) {
          setError(
            err.message ||
              "Unable to load infrastructure memory.",
          );

          setMemory([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadMemory();

    return () => {
      ignore = true;
    };
  }, [projectId]);

  return {
    memory,
    loading,
    error,
  };
}