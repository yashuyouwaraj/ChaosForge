"use client";
import { api } from "../../lib/api";
import { useState } from "react";
import { useProject } from "@/components/providers/ProjectProvider";

import { useRun } from "@/components/providers/RunProvider";

export function CreateSimulationPanel() {
  const { setSelectedRun } = useRun();
  const { projectId } = useProject();

  const [form, setForm] = useState({
    url: "https://jsonplaceholder.typicode.com/posts",

    rps: 100,

    duration: 30,

    method: "GET",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setLoading(true);

      const data = await api(
        `/test/${projectId}`,
        "POST",
        {
          url: form.url,
          config: {
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
          },
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

        {/* DURATION */}
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
    </div>
  );
}
