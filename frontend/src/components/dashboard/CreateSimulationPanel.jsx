"use client";
import { api } from "../../lib/api";
import { useEffect, useState } from "react";
import { useProject } from "@/components/providers/ProjectProvider";

import { useRun } from "@/components/providers/RunProvider";
import {
  pauseRun,
  resumeRun,
  stopRun,
  updateRunRate,
} from "@/lib/socket";

export function CreateSimulationPanel() {
  const { selectedRun, setSelectedRun } = useRun();
  const { projectId } = useProject();

  const [form, setForm] = useState({
    url: "https://jsonplaceholder.typicode.com/posts",

    mode: "duration",

    rps: 100,

    duration: 30,

    totalRequests: 2000,

    method: "GET",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [controlRate, setControlRate] = useState(100);
  const [controlError, setControlError] = useState("");
  const [controlMessage, setControlMessage] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    setControlRate(form.rps);
  }, [form.rps]);

  const hasSelectedRun =
    Boolean(selectedRun.projectId) &&
    Boolean(selectedRun.runId);

  const selectedRunStatus =
    selectedRun.status || "completed";

  const canPause =
    hasSelectedRun &&
    selectedRunStatus === "running";

  const canResume =
    hasSelectedRun &&
    selectedRunStatus === "paused";

  const canStop =
    hasSelectedRun &&
    (selectedRunStatus === "running" ||
      selectedRunStatus === "paused");

  const handleControlAction =
    async (
      actionName,
      action,
      message,
    ) => {
      if (!hasSelectedRun) {
        setControlError("Select or launch a run first.");
        return;
      }

      try {
        setControlError("");
        setControlMessage("");
        setActionLoading(actionName);

        await action(
          selectedRun.projectId,
          selectedRun.runId,
        );

        setControlMessage(message);
      } catch (err) {
        setControlError(
          err.message ||
            "Failed to update run control.",
        );
      } finally {
        setActionLoading("");
      }
    };

  const handleRateUpdate =
    async () => {
      if (!hasSelectedRun) {
        setControlError("Select or launch a run first.");
        return;
      }

      if (
        !Number.isFinite(controlRate) ||
        controlRate <= 0
      ) {
        setControlError("RPS must be greater than 0.");
        return;
      }

      try {
        setControlError("");
        setControlMessage("");
        setActionLoading("rate");

        await updateRunRate(
          selectedRun.projectId,
          selectedRun.runId,
          Number(controlRate),
        );

        setControlMessage(
          `RPS updated to ${controlRate}.`,
        );
      } catch (err) {
        setControlError(
          err.message ||
            "Failed to update RPS.",
        );
      } finally {
        setActionLoading("");
      }
    };

  const handleStart =
    async () => {
    if (!projectId) {
      setError(
        "Select a project first from the Projects page.",
      );

      return;
    }

    try {
      setError("");

      if (!Number.isFinite(form.rps) || form.rps <= 0) {
        throw new Error("Requests / Second must be greater than 0.");
      }

      if (
        form.mode === "requests" &&
        (!Number.isFinite(form.totalRequests) ||
          form.totalRequests <= 0)
      ) {
        throw new Error("Total Requests must be greater than 0.");
      }

      if (
        form.mode === "duration" &&
        (!Number.isFinite(form.duration) ||
          form.duration <= 0)
      ) {
        throw new Error("Duration must be greater than 0.");
      }

      setLoading(true);

      const config =
        form.mode === "requests"
          ? {
              method: form.method,
              pattern: "requests",
              concurrency: form.rps,
              totalRequests: form.totalRequests,
              rate: form.rps,
            }
          : {
              method: form.method,
              pattern: "stages",
              concurrency: form.rps,
              stages: [
                {
                  durationSec:
                    form.duration,
                  rate: form.rps,
                },
              ],
            };

      const data = await api(
        `/test/${projectId}`,
        "POST",
        {
          url: form.url,
          config,
        },
      );

      if (!data?.runId) {
        throw new Error(
          "Run ID missing from response",
        );
      }

      localStorage.setItem(
        "currentRunId",
        data.runId,
      );

      localStorage.setItem(
        "currentRunActive",
        "true",
      );

      setSelectedRun({
        projectId,
        runId:
          data.runId,
        status: data.status || "running",
      });

    } catch (err) {
      setError(
        err.message ||
          "Failed to launch simulation.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="create-simulation-panel"
      className="
        glass rounded-[32px]
        p-8
      "
    >
      <div className="mb-8">
        <p
          className="
            text-sm uppercase
            tracking-[0.3em]
            text-cyan-400
          "
        >
          Orchestration
        </p>

        <h2
          className="
            mt-4 text-4xl
            font-black
          "
        >
          Create Simulation
        </h2>

        <p
          className="
            mt-3 max-w-2xl
            text-muted-foreground
          "
        >
          Launch distributed traffic simulations directly from the ChaosForge
          control plane.
        </p>
      </div>

      <div
        className="
          grid gap-6
          md:grid-cols-2
        "
      >
        <div className="space-y-3 md:col-span-2">
          <label
            className="
              text-sm font-medium
            "
          >
            Run Mode
          </label>

          <div
            className="
              grid gap-3
              sm:grid-cols-2
            "
          >
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  mode: "duration",
                })
              }
              className={`
                rounded-2xl border px-5 py-4
                text-left text-sm font-semibold
                transition
                ${
                  form.mode === "duration"
                    ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                    : "border-white/10 bg-black/20 text-muted-foreground"
                }
              `}
            >
              Duration
            </button>

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  mode: "requests",
                })
              }
              className={`
                rounded-2xl border px-5 py-4
                text-left text-sm font-semibold
                transition
                ${
                  form.mode === "requests"
                    ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                    : "border-white/10 bg-black/20 text-muted-foreground"
                }
              `}
            >
              Request Count
            </button>
          </div>
        </div>

        {/* URL */}
        <div className="space-y-3">
          <label
            className="
              text-sm font-medium
            "
          >
            Target URL
          </label>

          <input
            value={form.url}
            onChange={(e) =>
              setForm({
                ...form,
                url: e.target.value,
              })
            }
            className="
              w-full rounded-2xl
              border border-white/10
              bg-black/20
              px-5 py-4
              outline-none
            "
          />
        </div>

        {/* METHOD */}
        <div className="space-y-3">
          <label
            className="
              text-sm font-medium
            "
          >
            HTTP Method
          </label>

          <select
            value={form.method}
            onChange={(e) =>
              setForm({
                ...form,
                method: e.target.value,
              })
            }
            className="
              w-full rounded-2xl
              border border-white/10
              bg-black/20
              px-5 py-4
              outline-none
            "
          >
            <option>GET</option>

            <option>POST</option>
          </select>
        </div>

        {/* RPS */}
        <div className="space-y-3">
          <label
            className="
              text-sm font-medium
            "
          >
            Requests / Second
          </label>

          <input
            type="number"
            value={form.rps}
            onChange={(e) =>
              setForm({
                ...form,
                rps: Number(e.target.value),
              })
            }
            className="
              w-full rounded-2xl
              border border-white/10
              bg-black/20
              px-5 py-4
              outline-none
            "
          />
        </div>

        {form.mode === "duration" ? (
          <div className="space-y-3">
            <label
              className="
                text-sm font-medium
              "
            >
              Duration (seconds)
            </label>

            <input
              type="number"
              min="1"
              value={form.duration}
              onChange={(e) =>
                setForm({
                  ...form,
                  duration: Number(e.target.value),
                })
              }
              className="
                w-full rounded-2xl
                border border-white/10
                bg-black/20
                px-5 py-4
                outline-none
              "
            />
          </div>
        ) : (
          <div className="space-y-3">
            <label
              className="
                text-sm font-medium
              "
            >
              Total Requests
            </label>

            <input
              type="number"
              min="1"
              value={form.totalRequests}
              onChange={(e) =>
                setForm({
                  ...form,
                  totalRequests: Number(e.target.value),
                })
              }
              className="
                w-full rounded-2xl
                border border-white/10
                bg-black/20
                px-5 py-4
                outline-none
              "
            />
          </div>
        )}
      </div>

      {error ? (
        <div
          className="
            mt-6 rounded-2xl
            border border-red-500/20
            bg-red-500/5
            px-4 py-3 text-sm
            text-red-300
          "
        >
          {error}
        </div>
      ) : null}

      <button
        onClick={handleStart}
        disabled={loading}
        className="
          mt-8 rounded-2xl
          bg-cyan-500
          px-8 py-4
          font-bold text-black
          transition
          hover:scale-[1.02]
          disabled:opacity-50
        "
      >
        {loading ? "Starting..." : "Launch Simulation"}
      </button>

      <div
        className="
          mt-8 grid gap-4
          border-t border-white/10
          pt-8
          xl:grid-cols-[1.4fr,1fr]
        "
      >
        <div>
          <p
            className="
              text-sm uppercase
              tracking-[0.3em]
              text-cyan-400
            "
          >
            Live Controls
          </p>

          <h3
            className="
              mt-3 text-2xl
              font-black
            "
          >
            Run Command Controls
          </h3>

          <p
            className="
              mt-2 text-sm
              text-muted-foreground
            "
          >
            Control the selected simulation in realtime with pause, resume,
            stop, and live RPS changes.
          </p>

          <div
            className="
              mt-5 flex flex-wrap
              items-center gap-3
              text-sm text-muted-foreground
            "
          >
            <span>
              Run: {selectedRun.runId || "No run selected"}
            </span>

            <span>
              Status: {selectedRun.status || "idle"}
            </span>
          </div>
        </div>

        <div
          className="
            rounded-2xl border
            border-white/10
            bg-black/20
            p-5
          "
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() =>
                handleControlAction(
                  "pause",
                  pauseRun,
                  "Simulation paused.",
                )
              }
              disabled={!canPause || actionLoading !== ""}
              className="
                rounded-xl bg-yellow-500
                px-4 py-3 text-sm
                font-semibold text-black
                transition hover:scale-[1.02]
                disabled:opacity-50
              "
            >
              {actionLoading === "pause" ? "Pausing..." : "Pause"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleControlAction(
                  "resume",
                  resumeRun,
                  "Simulation resumed.",
                )
              }
              disabled={!canResume || actionLoading !== ""}
              className="
                rounded-xl bg-green-500
                px-4 py-3 text-sm
                font-semibold text-black
                transition hover:scale-[1.02]
                disabled:opacity-50
              "
            >
              {actionLoading === "resume" ? "Resuming..." : "Resume"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleControlAction(
                  "stop",
                  stopRun,
                  "Simulation stopped.",
                )
              }
              disabled={!canStop || actionLoading !== ""}
              className="
                rounded-xl bg-red-500
                px-4 py-3 text-sm
                font-semibold text-white
                transition hover:scale-[1.02]
                disabled:opacity-50
              "
            >
              {actionLoading === "stop" ? "Stopping..." : "Stop"}
            </button>
          </div>

          <div
            className="
              mt-4 flex gap-3
              sm:items-center
            "
          >
            <input
              type="number"
              min="1"
              value={controlRate}
              onChange={(e) =>
                setControlRate(
                  Number(e.target.value),
                )
              }
              className="
                min-w-0 flex-1 rounded-xl
                border border-white/10
                bg-black/30
                px-4 py-3 outline-none
              "
              placeholder="Change RPS"
            />

            <button
              type="button"
              onClick={handleRateUpdate}
              disabled={!canStop || actionLoading !== ""}
              className="
                rounded-xl border
                border-cyan-400/30
                bg-cyan-500/10
                px-5 py-3 text-sm
                font-semibold text-cyan-300
                transition hover:bg-cyan-500/20
                disabled:opacity-50
              "
            >
              {actionLoading === "rate" ? "Updating..." : "Apply RPS"}
            </button>
          </div>

          {controlError ? (
            <div
              className="
                mt-4 rounded-xl
                border border-red-500/20
                bg-red-500/5 px-4
                py-3 text-sm text-red-300
              "
            >
              {controlError}
            </div>
          ) : null}

          {controlMessage ? (
            <div
              className="
                mt-4 rounded-xl
                border border-green-500/20
                bg-green-500/5 px-4
                py-3 text-sm text-green-300
              "
            >
              {controlMessage}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
