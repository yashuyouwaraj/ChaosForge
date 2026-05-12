"use client";

import {
  useEffect,
  useState,
} from "react";

import { api }
  from "@/lib/api";

export function useInfrastructureHealth() {
  const [health, setHealth] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let ignore = false;

    const loadHealth =
      async () => {
        try {
          const data =
            await api("/health");

          if (!ignore) {
            setHealth(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (!ignore) {
            setLoading(false);
          }
        }
      };

    loadHealth();

    const intervalId =
      window.setInterval(
        loadHealth,
        5000,
      );

    return () => {
      ignore = true;

      window.clearInterval(
        intervalId,
      );
    };
  }, []);

  return {
    health,
    loading,
  };
}