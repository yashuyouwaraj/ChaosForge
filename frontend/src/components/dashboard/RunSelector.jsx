"use client";

import { useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";
import { useProject } from "@/components/providers/ProjectProvider";
import { useRun } from "@/components/providers/RunProvider";

const isActiveStatus = (status) => status === "running" || status === "paused";

export function RunSelector() {
  const { selectedRun, setSelectedRun } = useRun();
  const { projectId } = useProject();
  const [runs, setRuns] = useState([]);
  const selectedRunIdRef = useRef(selectedRun.runId);

  useEffect(() => {
    selectedRunIdRef.current = selectedRun.runId;
  }, [selectedRun.runId]);

  useEffect(() => {
    if (!projectId) {
      setRuns([]);
      return;
    }

    let ignore = false;

    const loadRuns = async () => {
      try {
        const data = await api(`/runs/${projectId}`);

        if (ignore) {
          return;
        }

        const nextRuns = [...(data || [])].sort((a, b) => {
          const activeDiff =
            Number(isActiveStatus(b.status)) - Number(isActiveStatus(a.status));

          if (activeDiff !== 0) {
            return activeDiff;
          }

          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        });

        setRuns(nextRuns);

        const selectedStillExists = nextRuns.some(
          (run) => run.runId === selectedRunIdRef.current,
        );
        const activeRun = nextRuns.find((run) => isActiveStatus(run.status));

        if (!selectedRunIdRef.current && (activeRun || nextRuns[0])) {
          const nextRun = activeRun || nextRuns[0];

          setSelectedRun({
            projectId,
            runId: nextRun.runId,
            status: nextRun.status,
          });
          return;
        }

        if (
          selectedRunIdRef.current &&
          !selectedStillExists &&
          (activeRun || nextRuns[0])
        ) {
          const nextRun = activeRun || nextRuns[0];

          setSelectedRun({
            projectId,
            runId: nextRun.runId,
            status: nextRun.status,
          });
        }
      } catch {
        if (!ignore) {
          setRuns([]);
        }
      }
    };

    loadRuns();

    const intervalId = window.setInterval(loadRuns, 5000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [projectId]);

  const activeRuns = runs.filter((run) => isActiveStatus(run.status));
  const hasRuns = activeRuns.length > 0;
  const currentIndex = activeRuns.findIndex(
    (run) => run.runId === selectedRun.runId,
  );
  const currentRun = currentIndex >= 0 ? activeRuns[currentIndex] : null;

  const switchRunByIndex = (index) => {
    const run = activeRuns[index];

    if (!run) {
      return;
    }

    setSelectedRun({
      projectId,
      runId: run.runId,
      status: run.status,
    });
  };

  return (
    <div
      className="
        glass rounded-2xl
        p-4
      "
    >
      <div
        className="
          flex items-center
          justify-between gap-4
        "
      >
        <div>
          <p
            className="
              text-xs uppercase
              tracking-[0.2em]
              text-muted-foreground
            "
          >
            Active Run
          </p>

          <h3
            className="
              mt-2 text-xl
              font-bold
            "
          >
            {selectedRun.runId || "No run selected"}
          </h3>

          <p
            className="
              mt-2 text-sm
              text-muted-foreground
            "
          >
            {currentRun?.status
              ? `Status: ${currentRun.status}`
              : "Select a run to inspect"}
            {activeRuns.length > 0
              ? ` • ${activeRuns.length} active`
              : " • no active runs"}
          </p>
        </div>

        <div
          className="
            flex items-center
            gap-3
          "
        >
          <button
            type="button"
            disabled={!hasRuns || currentIndex <= 0}
            onClick={() => switchRunByIndex(currentIndex - 1)}
            className="
              rounded-xl border
              border-white/10
              bg-black/20 px-4 py-3
              text-sm transition
              disabled:opacity-40
            "
          >
            Prev
          </button>

          <select
            value={selectedRun.runId || ""}
            disabled={!hasRuns}
            onChange={(e) => {
              const run = activeRuns.find(
                (item) => item.runId === e.target.value,
              );

              if (run) {
                setSelectedRun({
                  projectId,
                  runId: run.runId,
                  status: run.status,
                });
              }
            }}
            className="
              rounded-xl border
              border-white/10
              bg-black/30
              px-4 py-3
              outline-none
            "
          >
            {!hasRuns && <option value="">No active runs</option>}

            {activeRuns.map((run) => (
              <option key={run.runId} value={run.runId}>
                {run.runId}
                {" / "}
                {run.status}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={
              !hasRuns ||
              currentIndex < 0 ||
              currentIndex >= activeRuns.length - 1
            }
            onClick={() => switchRunByIndex(currentIndex + 1)}
            className="
              rounded-xl border
              border-white/10
              bg-black/20 px-4 py-3
              text-sm transition
              disabled:opacity-40
            "
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
