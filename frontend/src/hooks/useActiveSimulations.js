"use client";

import {
  useEffect,
  useState,
} from "react";

import { api } from "@/lib/api";
import { useProject } from "@/components/providers/ProjectProvider";

const getExpectedDurationMs = (
  run,
) => {
  const config =
    run?.config || {};

  if (
    Array.isArray(config.stages)
  ) {
    return (
      config.stages.reduce(
        (total, stage) =>
          total +
          Number(
            stage.durationSec || 0,
          ),
        0,
      ) * 1000
    );
  }

  const totalRequests = Number(
    config.totalRequests || 0,
  );
  const rate = Number(
    config.rate || 0,
  );

  if (
    totalRequests > 0 &&
    rate > 0
  ) {
    return Math.ceil(
      totalRequests / rate,
    ) * 1000;
  }

  return 0;
};

const getDurationLabel = (
  run,
) => {
  const config =
    run?.config || {};

  if (
    Array.isArray(config.stages)
  ) {
    const totalSeconds =
      config.stages.reduce(
        (total, stage) =>
          total +
          Number(
            stage.durationSec || 0,
          ),
        0,
      );

    return `${totalSeconds}s`;
  }

  const totalRequests = Number(
    config.totalRequests || 0,
  );
  const rate = Number(
    config.rate || 0,
  );

  if (
    totalRequests > 0 &&
    rate > 0
  ) {
    return `${Math.ceil(
      totalRequests / rate,
    )}s`;
  }

  return "-";
};

const isLikelyStillActive = (
  run,
) => {
  if (
    run.status !== "starting" &&
    run.status !== "running" &&
    run.status !== "paused"
  ) {
    return false;
  }

  const createdAt =
    run.createdAt
      ? new Date(
          run.createdAt,
        ).getTime()
      : 0;
  const expectedDurationMs =
    getExpectedDurationMs(run);

  if (
    !createdAt ||
    !expectedDurationMs
  ) {
    return (
      Date.now() - createdAt <=
      10 * 60 * 1000
    );
  }

  const graceMs = 30000;

  return (
    Date.now() <=
    createdAt +
      expectedDurationMs +
      graceMs
  );
};

export function useActiveSimulations() {
  const [runs, setRuns] =
    useState([]);
  const { projectId } =
    useProject();

  useEffect(() => {
    if (!projectId) {
      queueMicrotask(() => {
        setRuns([]);
      });
      return;
    }

    let ignore = false;

    const loadRuns = async () => {
      try {
        const data = await api(
          `/runs/${projectId}`,
        );

        if (ignore) {
          return;
        }

        const activeRuns =
          (data || []).filter(
            isLikelyStillActive,
          );

        const runsWithMetrics =
          await Promise.all(
            activeRuns.map(
              async (run) => {
                try {
                  const metrics =
                    await api(
                      `/metrics/${projectId}?runId=${run.runId}`,
                    );

                  return {
                    ...run,
                    ...metrics,
                    currentRps:
                      metrics.currentRps ||
                      metrics.rps ||
                      run.currentRps ||
                      run.rps ||
                      0,
                    duration:
                      getDurationLabel(run),
                  };
                } catch {
                  return {
                    ...run,
                    currentRps:
                      run.currentRps ||
                      run.rps ||
                      0,
                    duration:
                      getDurationLabel(run),
                  };
                }
              },
            ),
          );

        if (ignore) {
          return;
        }

        setRuns(runsWithMetrics);
      } catch {
        if (!ignore) {
          setRuns([]);
        }
      }
    };

    loadRuns();

    const intervalId =
      window.setInterval(
        loadRuns,
        5000,
      );

    return () => {
      ignore = true;
      window.clearInterval(
        intervalId,
      );
    };
  }, [projectId]);

  return runs;
}
