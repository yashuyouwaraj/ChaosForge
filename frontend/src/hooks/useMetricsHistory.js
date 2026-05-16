"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRealtimeMetrics,
} from "@/hooks/useRealtimeMetrics";
import { api } from "@/lib/api";

const MAX_HISTORY_POINTS = 240;
const historyCache = new Map();
const HISTORY_STORAGE_PREFIX = "metricsHistory:";

const DEFAULT_ERROR_TYPES = {
  timeout: 0,
  network: 0,
  server: 0,
};

const hasTelemetry = (metrics) =>
  Boolean(metrics) &&
  (Number(metrics.totalRequests || 0) > 0 ||
    Number(metrics.avgLatency || 0) > 0 ||
    Number(metrics.p95Latency || 0) > 0 ||
    Number(metrics.currentRps || 0) > 0 ||
    Number(metrics.rps || 0) > 0);

const getStorageKey = (runKey) =>
  `${HISTORY_STORAGE_PREFIX}${runKey}`;

const readStoredHistory = (runKey) => {
  if (!runKey || typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.sessionStorage.getItem(
      getStorageKey(runKey),
    );

    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const writeStoredHistory = (runKey, history) => {
  if (!runKey || typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getStorageKey(runKey),
      JSON.stringify(history),
    );
  } catch {
    return;
  }
};

const getCachedHistory = (runKey) => {
  if (!runKey) {
    return [];
  }

  const memoryHistory =
    historyCache.get(runKey);

  if (memoryHistory?.length) {
    return memoryHistory;
  }

  const storedHistory =
    readStoredHistory(runKey);

  if (storedHistory.length) {
    historyCache.set(
      runKey,
      storedHistory,
    );
  }

  return storedHistory;
};

const cacheHistory = (runKey, history) => {
  historyCache.set(runKey, history);
  writeStoredHistory(runKey, history);
};

const createHistoryPoint = (metrics, prev) => {
  const timestamp =
    Date.now();
  const startTimestamp =
    prev[0]?.timestamp ||
    timestamp;
  const elapsedSec =
    Math.max(
      0,
      Math.round(
        (timestamp -
          startTimestamp) /
          1000,
      ),
    );

  return {
    timestamp,
    elapsedSec,
    rps:
      metrics.currentRps ||
      metrics.rps ||
      0,
    avgLatency:
      metrics.avgLatency || 0,
    p95Latency:
      metrics.p95Latency || 0,
    failures:
      metrics.failure || 0,
    errorTypes:
      metrics.errorTypes ||
      DEFAULT_ERROR_TYPES,
  };
};

export function useMetricsHistory(
  projectId,
  runId,
  isActive = true,
) {
  const runKey =
    projectId && runId
      ? `${projectId}:${runId}`
      : null;
  const metrics =
    useRealtimeMetrics(
      projectId,
      runId,
    );

  const [history, setHistory] =
    useState(() =>
      runKey
        ? getCachedHistory(runKey)
        : [],
    );
  const [fetchedMetrics, setFetchedMetrics] =
    useState(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setHistory(
        runKey
          ? getCachedHistory(runKey)
          : [],
      );
      setFetchedMetrics(null);
    });

    return () => {
      cancelled = true;
    };
  }, [runKey]);

  useEffect(() => {
    if (!projectId || !runId) {
      return;
    }

    let ignore = false;

    const loadMetrics = async () => {
      try {
        const data = await api(
          `/metrics/${projectId}?runId=${runId}`,
        );

        if (!ignore) {
          setFetchedMetrics({
            runKey,
            metrics: data,
          });
        }
      } catch {
        if (!ignore) {
          setFetchedMetrics({
            runKey,
            metrics: null,
          });
        }
      }
    };

    loadMetrics();

    const intervalId = isActive
      ? window.setInterval(loadMetrics, 5000)
      : null;

    return () => {
      ignore = true;

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [
    projectId,
    runId,
    isActive,
    runKey,
  ]);

  const fetchedMetricsForRun =
    fetchedMetrics?.runKey === runKey
      ? fetchedMetrics.metrics
      : null;
  const nextMetrics =
    metrics || fetchedMetricsForRun;

  useEffect(() => {
    if (!runKey || !hasTelemetry(nextMetrics)) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setHistory((prev) => {
        const nextPoint =
          createHistoryPoint(
            nextMetrics,
            prev,
          );

        if (
          prev.length > 0 &&
          prev[
            prev.length - 1
          ].elapsedSec ===
            nextPoint.elapsedSec
        ) {
          const next = [
            ...prev.slice(0, -1),
            nextPoint,
          ];

          cacheHistory(runKey, next);

          return next;
        }

        const next = [
          ...prev,
          nextPoint,
        ].slice(-MAX_HISTORY_POINTS);

        cacheHistory(runKey, next);

        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [
    nextMetrics,
    runKey,
  ]);

  return history;
}
