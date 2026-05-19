"use client";

import { useState } from "react";
import { Pause, Play, RadioTower, Square } from "lucide-react";

import { useRun } from "@/components/providers/RunProvider";
import {
  pauseRun,
  resumeRun,
  stopRun,
  updateRunRate,
} from "@/lib/socket";

const isActiveStatus = (status) => status === "running" || status === "paused";

export function SimulationControlCenter() {
  const { selectedRun, setSelectedRun } = useRun();
  const [rate, setRate] = useState(100);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const hasRun = Boolean(selectedRun?.projectId && selectedRun?.runId);
  const status = selectedRun?.status || "idle";
  const canPause = hasRun && status === "running";
  const canResume = hasRun && status === "paused";
  const canStop = hasRun && isActiveStatus(status);

  const runAction = async (actionName, action, nextStatus, successMessage) => {
    if (!hasRun) {
      setError("Select or launch a simulation run first.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setActionLoading(actionName);

      await action(selectedRun.projectId, selectedRun.runId);

      setSelectedRun({
        ...selectedRun,
        status: nextStatus,
      });
      setMessage(successMessage);
    } catch (err) {
      setError(err.message || "Unable to update run control.");
    } finally {
      setActionLoading("");
    }
  };

  const handleRateUpdate = async () => {
    if (!hasRun) {
      setError("Select or launch a simulation run first.");
      return;
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      setError("RPS must be greater than 0.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setActionLoading("rate");

      await updateRunRate(selectedRun.projectId, selectedRun.runId, rate);
      setMessage(`Throughput target updated to ${rate} RPS.`);
    } catch (err) {
      setError(err.message || "Unable to update RPS.");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <section className="glass rounded-[28px] p-6 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[1fr,1.25fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-400">
            Realtime Command Plane
          </p>

          <h2 className="mt-4 text-3xl font-black">Simulation Control Center</h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Operate the selected distributed run with websocket-backed pause,
            resume, stop, and live throughput controls.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Selected Run
              </p>
              <p className="mt-2 break-all font-mono text-sm text-slate-200">
                {selectedRun?.runId || "No run selected"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                State
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm capitalize">
                <span
                  className={`h-2 w-2 rounded-full ${
                    status === "running"
                      ? "bg-emerald-400"
                      : status === "paused"
                        ? "bg-yellow-400"
                        : "bg-slate-500"
                  }`}
                />
                {status}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() =>
                runAction("pause", pauseRun, "paused", "Simulation paused.")
              }
              disabled={!canPause || actionLoading !== ""}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:opacity-50"
            >
              <Pause size={16} />
              {actionLoading === "pause" ? "Pausing" : "Pause"}
            </button>

            <button
              type="button"
              onClick={() =>
                runAction("resume", resumeRun, "running", "Simulation resumed.")
              }
              disabled={!canResume || actionLoading !== ""}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:opacity-50"
            >
              <Play size={16} />
              {actionLoading === "resume" ? "Resuming" : "Resume"}
            </button>

            <button
              type="button"
              onClick={() =>
                runAction("stop", stopRun, "stopped", "Simulation stopped.")
              }
              disabled={!canStop || actionLoading !== ""}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50"
            >
              <Square size={16} />
              {actionLoading === "stop" ? "Stopping" : "Stop"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,auto]">
            <input
              type="number"
              min="1"
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="min-w-0 rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              placeholder="Change RPS"
            />

            <button
              type="button"
              onClick={handleRateUpdate}
              disabled={!canStop || actionLoading !== ""}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
            >
              <RadioTower size={16} />
              {actionLoading === "rate" ? "Updating" : "Apply RPS"}
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
