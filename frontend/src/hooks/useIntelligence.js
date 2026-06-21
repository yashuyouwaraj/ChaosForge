"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";
import socket, { ensureSocketConnected } from "@/lib/socket";

const EMPTY_INTELLIGENCE = null;
const LIVE_REST_FALLBACK_MS = 4000;
const cache = new Map();
const inflight = new Map();

const cacheKey = (projectId, runId) => `${projectId}:${runId}`;

const isLiveRun = (projectId, runId) => {
  if (typeof window === "undefined" || !projectId || !runId) {
    return false;
  }

  return (
    localStorage.getItem("currentRunActive") === "true" &&
    localStorage.getItem("currentRunId") === runId &&
    localStorage.getItem("projectId") === projectId
  );
};

const mergeIntelligenceUpdate = (existing, update) => {
  if (!update) {
    return existing;
  }

  const merged = {
    ...(existing || {}),
    projectId: update.projectId,
    runId: update.runId,
    generatedAt:
      update.timestamp || update.generatedAt || new Date().toISOString(),
    health: update.health ?? existing?.health,
    risk: update.risk ?? existing?.risk,
    rootCause: update.rootCause ?? existing?.rootCause,
    recommendations: update.recommendations ?? existing?.recommendations,
    trends: update.trend ?? update.trends ?? existing?.trends,
    operationalInsights:
      update.operationalInsights ?? existing?.operationalInsights,
  };

  if (merged.health) {
    merged.healthScore = merged.health;
  }

  if (merged.risk) {
    merged.predictiveRisk = {
      level: merged.risk.level,
      risk: merged.risk.risk,
      forecast: merged.risk.forecast,
      confidence: merged.risk.confidence,
      contributingFactors: merged.risk.contributingFactors,
    };
  }

  if (merged.rootCause) {
    merged.rootCauseAnalysis = merged.rootCause;
  }

  if (merged.recommendations) {
    merged.aiRecommendations = merged.recommendations;
  }

  return merged;
};

export function useIntelligence(projectId, runId, initialData = null) {
  const key = projectId && runId ? cacheKey(projectId, runId) : null;
  const cached = key ? cache.get(key) : null;
  const liveRef = useRef(false);
  const receivedStreamRef = useRef(false);

  const [data, setData] = useState(initialData || cached || EMPTY_INTELLIGENCE);
  const [loading, setLoading] = useState(
    Boolean(projectId && runId) && !initialData && !cached,
  );
  const [error, setError] = useState("");

  const applyIntelligenceUpdate = useCallback(
    (update) => {
      if (
        !update ||
        update.projectId !== projectId ||
        update.runId !== runId
      ) {
        return;
      }

      receivedStreamRef.current = true;

      setData((previous) => {
        const merged = mergeIntelligenceUpdate(previous, update);

        if (key) {
          cache.set(key, merged);
        }

        return merged;
      });
      setLoading(false);
      setError("");
    },
    [projectId, runId, key],
  );

  const fetchIntelligence = useCallback(async () => {
    if (!projectId || !runId || !key) {
      return null;
    }

    if (inflight.has(key)) {
      return inflight.get(key);
    }

    const request = api(
      `/api/intelligence/${projectId}/${encodeURIComponent(runId)}`,
    );

    inflight.set(key, request);

    try {
      const result = await request;
      cache.set(key, result);
      return result;
    } finally {
      inflight.delete(key);
    }
  }, [projectId, runId, key]);

  useEffect(() => {
    receivedStreamRef.current = false;
    liveRef.current = isLiveRun(projectId, runId);
  }, [projectId, runId]);

  useEffect(() => {
    if (!projectId || !runId) {
      return;
    }

    const handleIntelligenceUpdate = (update) => {
      applyIntelligenceUpdate(update);
    };

    if (liveRef.current) {
      ensureSocketConnected();
    }

    socket.on("intelligence:update", handleIntelligenceUpdate);

    return () => {
      socket.off("intelligence:update", handleIntelligenceUpdate);
    };
  }, [projectId, runId, applyIntelligenceUpdate]);

  useEffect(() => {
    if (initialData) {
      if (key) {
        cache.set(key, initialData);
      }

      setData(initialData);
      setLoading(false);
      setError("");
      return;
    }

    if (!projectId || !runId) {
      setData(EMPTY_INTELLIGENCE);
      setLoading(false);
      setError("");
      return;
    }

    if (cache.has(key)) {
      setData(cache.get(key));
      setLoading(false);
      setError("");
      return;
    }

    let ignore = false;
    let fallbackTimerId = null;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const live = isLiveRun(projectId, runId);

        if (live && socket.connected) {
          fallbackTimerId = window.setTimeout(async () => {
            if (ignore || receivedStreamRef.current || cache.has(key)) {
              return;
            }

            try {
              const result = await fetchIntelligence();

              if (!ignore && result) {
                setData(result);
              }
            } catch (err) {
              if (!ignore) {
                setError(err.message || "Failed to load intelligence");
                setData(EMPTY_INTELLIGENCE);
              }
            } finally {
              if (!ignore) {
                setLoading(false);
              }
            }
          }, LIVE_REST_FALLBACK_MS);

          return;
        }

        const result = await fetchIntelligence();

        if (!ignore) {
          setData(result);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load intelligence");
          setData(EMPTY_INTELLIGENCE);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    const handleDisconnect = () => {
      if (!isLiveRun(projectId, runId) || ignore) {
        return;
      }

      load();
    };

    socket.on("disconnect", handleDisconnect);
    load();

    return () => {
      ignore = true;

      if (fallbackTimerId) {
        window.clearTimeout(fallbackTimerId);
      }

      socket.off("disconnect", handleDisconnect);
    };
  }, [projectId, runId, initialData, key, fetchIntelligence]);

  return {
    intelligence: data,
    loading,
    error,
  };
}

export function primeIntelligenceCache(projectId, runId, data) {
  if (!projectId || !runId || !data) {
    return;
  }

  cache.set(cacheKey(projectId, runId), data);
}
