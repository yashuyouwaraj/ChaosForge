"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { api } from "@/lib/api";
import socket, {
  joinRun,
  leaveRun,
} from "@/lib/socket";

const RunContext =
  createContext(null);

const isActiveStatus = (
  status,
) =>
  status === "running" ||
  status === "paused";

export function RunProvider({ children }) {
  const [selectedRunState, setSelectedRunState] = useState({
    projectId: null,
    runId: null,
    status: null,
    isActive: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId =
      params.get("projectId") ||
      localStorage.getItem("projectId");
    const runId =
      params.get("runId") ||
      localStorage.getItem("currentRunId");

    if (!projectId && !runId) {
      return;
    }

    setSelectedRunState({
      projectId,
      runId,
      status:
        localStorage.getItem(
          "currentRunActive",
        ) === "true"
          ? "running"
          : null,
      isActive:
        localStorage.getItem(
          "currentRunActive",
        ) === "true",
    });
  }, []);

  useEffect(() => {
    if (!selectedRunState.projectId || !selectedRunState.runId) {
      return;
    }

    joinRun(
      selectedRunState.projectId,
      selectedRunState.runId,
    );

    return () => {
      leaveRun(selectedRunState.runId);
    };
  }, [
    selectedRunState.projectId,
    selectedRunState.runId,
  ]);

  useEffect(() => {
    if (!selectedRunState.projectId || !selectedRunState.runId) {
      return;
    }

    const completeEvent = `complete-${selectedRunState.projectId}-${selectedRunState.runId}`;

    const handleRunStatus = ({
      status,
    }) => {
      setSelectedRunState(
        (prev) => ({
          ...prev,
          status,
          isActive:
            isActiveStatus(
              status,
            ),
        }),
      );

      if (isActiveStatus(status)) {
        localStorage.setItem(
          "currentRunActive",
          "true",
        );
        return;
      }

      localStorage.removeItem(
        "currentRunActive",
      );
    };

    const handleComplete = () => {
      setSelectedRunState(
        (prev) => ({
          ...prev,
          status:
            prev.status ===
            "stopped"
              ? "stopped"
              : "completed",
          isActive: false,
        }),
      );

      localStorage.removeItem(
        "currentRunActive",
      );
      leaveRun(
        selectedRunState.runId,
      );
    };

    socket.on(
      "run-status",
      handleRunStatus,
    );
    socket.on(
      completeEvent,
      handleComplete,
    );

    return () => {
      socket.off(
        "run-status",
        handleRunStatus,
      );
      socket.off(
        completeEvent,
        handleComplete,
      );
    };
  }, [
    selectedRunState.projectId,
    selectedRunState.runId,
  ]);

  useEffect(() => {
    if (!selectedRunState.projectId || !selectedRunState.runId) {
      return;
    }

    let ignore = false;

    const syncRunStatus =
      async () => {
        try {
          const runs = await api(
            `/runs/${selectedRunState.projectId}`,
          );

          if (ignore) {
            return;
          }

          const matchedRun =
            (runs || []).find(
              (run) =>
                run.runId ===
                selectedRunState.runId,
            );

          if (!matchedRun) {
            return;
          }

          const status =
            matchedRun.status ||
            null;
          const isActive =
            isActiveStatus(
              status,
            );

          setSelectedRunState(
            (prev) => ({
              ...prev,
              status,
              isActive,
            }),
          );

          if (isActive) {
            localStorage.setItem(
              "currentRunActive",
              "true",
            );
          } else {
            localStorage.removeItem(
              "currentRunActive",
            );
          }
        } catch {
          return;
        }
      };

    syncRunStatus();

    const intervalId =
      window.setInterval(
        syncRunStatus,
        5000,
      );

    return () => {
      ignore = true;
      window.clearInterval(
        intervalId,
      );
    };
  }, [
    selectedRunState.projectId,
    selectedRunState.runId,
  ]);

  const setSelectedRun = (nextRun) => {
    setSelectedRunState({
      projectId:
        nextRun?.projectId ||
        null,
      runId:
        nextRun?.runId ||
        null,
      status:
        nextRun?.status ||
        null,
      isActive:
        isActiveStatus(
          nextRun?.status,
        ),
    });

    if (nextRun?.projectId) {
      localStorage.setItem(
        "projectId",
        nextRun.projectId,
      );
    }

    if (nextRun?.runId) {
      localStorage.setItem(
        "currentRunId",
        nextRun.runId,
      );

      if (
        isActiveStatus(
          nextRun?.status,
        )
      ) {
        localStorage.setItem(
          "currentRunActive",
          "true",
        );
      } else {
        localStorage.removeItem(
          "currentRunActive",
        );
      }
    } else {
      localStorage.removeItem(
        "currentRunId",
      );
      localStorage.removeItem(
        "currentRunActive",
      );
    }
  };

  return (
    <RunContext.Provider
      value={{
        selectedRun:
          selectedRunState,
        setSelectedRun,
      }}
    >
      {children}
    </RunContext.Provider>
  );
}

export function useRun() {
  return useContext(RunContext);
}
