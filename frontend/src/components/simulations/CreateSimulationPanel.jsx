"use client";
import { api } from "../../lib/api";
import { useState } from "react";
import { useProject } from "@/components/providers/ProjectProvider";

import { useRun } from "@/components/providers/RunProvider";

const defaultStages = [
  { durationSec: 10, rate: 10 },
  { durationSec: 10, rate: 50 },
  { durationSec: 10, rate: 100 },
  { durationSec: 10, rate: 50 },
  { durationSec: 10, rate: 10 },
];

export function CreateSimulationPanel() {
  const { setSelectedRun } = useRun();
  const { projectId } = useProject();

  const [form, setForm] = useState({
    url: "https://example.com/api",
    pattern: "stages",
    concurrency: 20,
    stages: defaultStages,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateStage = (index, field, value) => {
    const stages = form.stages.map((stage, stageIndex) =>
      stageIndex === index
        ? {
            ...stage,
            [field]: Number.parseInt(value, 10) || 0,
          }
        : stage,
    );

    setForm({
      ...form,
      stages,
    });
  };

  const addStage = () => {
    setForm({
      ...form,
      stages: [
        ...form.stages,
        {
          durationSec: 10,
          rate: 10,
        },
      ],
    });
  };

  const removeStage = (index) => {
    setForm({
      ...form,
      stages: form.stages.filter((_, stageIndex) => stageIndex !== index),
    });
  };

  const handleStart = async () => {
    if (!projectId) {
      setError(
        "Select a project first from the Projects page.",
      );

      return;
    }

    try {
      setError("");

      if (!form.url.trim()) {
        throw new Error("Test URL is required.");
      }

      if (
        !Number.isFinite(form.concurrency) ||
        form.concurrency <= 0
      ) {
        throw new Error("Concurrency must be greater than 0.");
      }

      if (form.stages.length === 0) {
        throw new Error("Add at least one stage.");
      }

      for (const stage of form.stages) {
        if (
          !Number.isFinite(stage.durationSec) ||
          stage.durationSec <= 0 ||
          !Number.isFinite(stage.rate) ||
          stage.rate <= 0
        ) {
          throw new Error("Each stage needs a duration and rate above 0.");
        }
      }

      setLoading(true);

      const config = {
        pattern: form.pattern,
        concurrency: form.concurrency,
        stages: form.stages,
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
        runId: data.runId,
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
          Start New Test
        </h2>

        <p
          className="
            mt-3 max-w-2xl
            text-muted-foreground
          "
        >
          Configure staged traffic and launch a realtime distributed simulation.
        </p>
      </div>

      <div
        className="
          space-y-6
        "
      >
        <div className="space-y-3">
          <label
            className="
              text-sm font-medium
            "
          >
            Test URL
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
              w-full rounded-xl
              border border-white/10
              bg-black/20
              px-5 py-4
              outline-none
            "
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label
              className="
                text-sm font-medium
              "
            >
              Pattern
            </label>

            <select
              value={form.pattern}
              onChange={(e) =>
                setForm({
                  ...form,
                  pattern: e.target.value,
                })
              }
              className="
                w-full rounded-xl
                border border-white/10
                bg-black/20
                px-5 py-4
                outline-none
              "
            >
              <option value="stages">Stages</option>
            </select>
          </div>

          <div className="space-y-3">
            <label
              className="
                text-sm font-medium
              "
            >
              Concurrency (max in-flight)
            </label>

            <input
              type="number"
              min="1"
              value={form.concurrency}
              onChange={(e) =>
                setForm({
                  ...form,
                  concurrency: Number(e.target.value),
                })
              }
              className="
                w-full rounded-xl
                border border-white/10
                bg-black/20
                px-5 py-4
                outline-none
              "
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Stages</label>

          <div className="space-y-3">
            {form.stages.map((stage, index) => (
              <div
                key={`stage-${index}`}
                className="
                  rounded-2xl border
                  border-white/10
                  bg-black/20 p-4
                "
              >
                <div
                  className="
                    grid gap-4
                    md:grid-cols-[auto_1fr_1fr_auto]
                    md:items-end
                  "
                >
                  <div className="text-sm font-semibold text-slate-200 md:pb-3">
                    Stage {index + 1}
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-400">
                      Duration (seconds)
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={stage.durationSec}
                      onChange={(e) =>
                        updateStage(index, "durationSec", e.target.value)
                      }
                      className="
                        w-full rounded-xl
                        border border-white/10
                        bg-black/30
                        px-4 py-3
                        outline-none
                      "
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-400">
                      Rate (requests/sec)
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={stage.rate}
                      onChange={(e) =>
                        updateStage(index, "rate", e.target.value)
                      }
                      className="
                        w-full rounded-xl
                        border border-white/10
                        bg-black/30
                        px-4 py-3
                        outline-none
                      "
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeStage(index)}
                    disabled={form.stages.length === 1}
                    className="
                      rounded-xl border
                      border-red-400/20
                      bg-red-500/10
                      px-4 py-3 text-sm
                      font-semibold text-red-300
                      transition hover:bg-red-500/20
                      disabled:opacity-50
                    "
                  >
                    Remove
                  </button>
                </div>

                <p className="mt-3 text-xs text-muted-foreground md:ml-[5.25rem]">
                  Sends {stage.rate || 0} requests per second for{" "}
                  {stage.durationSec || 0} seconds.
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addStage}
            className="
              rounded-xl border
              border-emerald-400/20
              bg-emerald-500/10
              px-5 py-3 text-sm
              font-semibold text-emerald-300
              transition hover:bg-emerald-500/20
            "
          >
            Add Stage
          </button>
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
        {loading ? "Starting Test..." : "Start Test"}
      </button>
    </div>
  );
}
