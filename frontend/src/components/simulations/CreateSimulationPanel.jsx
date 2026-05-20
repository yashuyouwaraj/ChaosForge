"use client";

import {
  Activity,
  Gauge,
  GitBranch,
  Link2,
  ListChecks,
  Plus,
  Rocket,
  SlidersHorizontal,
  Timer,
  Trash2,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useProject } from "@/components/providers/ProjectProvider";
import { useRun } from "@/components/providers/RunProvider";
import { api } from "@/lib/api";

const defaultStages = [
  { durationSec: 10, rate: 10 },
  { durationSec: 10, rate: 50 },
  { durationSec: 10, rate: 100 },
  { durationSec: 10, rate: 50 },
  { durationSec: 10, rate: 10 },
];

const runModes = [
  {
    id: "duration",
    label: "Duration",
    description: "Run steady traffic for a fixed time window.",
    icon: Timer,
  },
  {
    id: "requests",
    label: "Request Count",
    description: "Stop automatically after a target request volume.",
    icon: ListChecks,
  },
  {
    id: "configuration",
    label: "Configuration Run",
    description: "Shape custom staged traffic with multiple rates.",
    icon: SlidersHorizontal,
  },
];

const fieldClassName = `
  w-full rounded-xl
  border border-white/10
  bg-black/25
  px-5 py-4
  text-sm outline-none
  transition
  focus:border-cyan-400/60
  focus:bg-black/35
`;

export function CreateSimulationPanel() {
  const { setSelectedRun } = useRun();
  const { projectId } = useProject();

  const [form, setForm] = useState({
    url: "https://jsonplaceholder.typicode.com/posts",
    mode: "duration",
    method: "GET",
    rps: 100,
    duration: 30,
    totalRequests: 2000,
    concurrency: 20,
    stages: defaultStages,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeMode = runModes.find((mode) => mode.id === form.mode) || runModes[0];

  const runPreview = useMemo(() => {
    if (form.mode === "duration") {
      return {
        pattern: "Steady duration",
        duration: `${form.duration || 0}s`,
        requests: `${(form.rps || 0) * (form.duration || 0)}`,
        peakRate: `${form.rps || 0} RPS`,
      };
    }

    if (form.mode === "requests") {
      return {
        pattern: "Fixed request count",
        duration:
          form.rps > 0
            ? `~${Math.ceil((form.totalRequests || 0) / form.rps)}s`
            : "0s",
        requests: `${form.totalRequests || 0}`,
        peakRate: `${form.rps || 0} RPS`,
      };
    }

    const duration = form.stages.reduce(
      (total, stage) => total + Number(stage.durationSec || 0),
      0,
    );
    const requests = form.stages.reduce(
      (total, stage) =>
        total + Number(stage.durationSec || 0) * Number(stage.rate || 0),
      0,
    );
    const peakRate = Math.max(
      0,
      ...form.stages.map((stage) => Number(stage.rate || 0)),
    );

    return {
      pattern: `${form.stages.length} traffic stages`,
      duration: `${duration}s`,
      requests: `${requests}`,
      peakRate: `${peakRate} RPS`,
    };
  }, [form]);

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

  const validateCommonFields = () => {
    if (!form.url.trim()) {
      throw new Error("Target URL is required.");
    }

    if (form.mode !== "configuration") {
      if (!Number.isFinite(form.rps) || form.rps <= 0) {
        throw new Error("Requests / Second must be greater than 0.");
      }
      return;
    }

    if (!Number.isFinite(form.concurrency) || form.concurrency <= 0) {
      throw new Error("Concurrency must be greater than 0.");
    }
  };

  const buildConfig = () => {
    if (form.mode === "duration") {
      if (!Number.isFinite(form.duration) || form.duration <= 0) {
        throw new Error("Duration must be greater than 0.");
      }

      return {
        method: form.method,
        pattern: "stages",
        concurrency: form.rps,
        stages: [
          {
            durationSec: form.duration,
            rate: form.rps,
          },
        ],
      };
    }

    if (form.mode === "requests") {
      if (
        !Number.isFinite(form.totalRequests) ||
        form.totalRequests <= 0
      ) {
        throw new Error("Total Requests must be greater than 0.");
      }

      return {
        method: form.method,
        mode: "requests",
        pattern: "requests",
        concurrency: form.rps,
        totalRequests: form.totalRequests,
        rate: form.rps,
      };
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

    return {
      method: form.method,
      pattern: "stages",
      concurrency: form.concurrency,
      stages: form.stages,
    };
  };

  const handleStart = async () => {
    if (!projectId) {
      setError("Select a project first from the Projects page.");
      return;
    }

    try {
      setError("");
      validateCommonFields();

      const config = buildConfig();

      setLoading(true);

      const data = await api(`/test/${projectId}`, "POST", {
        url: form.url,
        config,
      });

      if (!data?.runId) {
        throw new Error("Run ID missing from response");
      }

      localStorage.setItem("currentRunId", data.runId);
      localStorage.setItem("currentRunActive", "true");

      setSelectedRun({
        projectId,
        runId: data.runId,
        status: data.status || "running",
      });
    } catch (err) {
      setError(err.message || "Failed to launch simulation.");
    } finally {
      setLoading(false);
    }
  };

  const ActiveModeIcon = activeMode.icon;

  return (
    <section
      id="create-simulation-panel"
      className="
        glass overflow-hidden rounded-[32px]
        border border-cyan-400/10
      "
    >
      <div
        className="
          grid gap-0
          xl:grid-cols-[1.25fr,0.75fr]
        "
      >
        <div className="p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
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
                Switch between fast launch modes and staged traffic profiles
                without leaving the simulation workspace.
              </p>
            </div>

            <div
              className="
                inline-flex items-center gap-2
                rounded-full border border-cyan-400/20
                bg-cyan-500/10 px-4 py-2
                text-sm font-semibold text-cyan-200
              "
            >
              <ActiveModeIcon size={16} />
              {activeMode.label}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-3 lg:grid-cols-3">
              {runModes.map((mode) => {
                const ModeIcon = mode.icon;
                const selected = form.mode === mode.id;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        mode: mode.id,
                      })
                    }
                    className={`
                      rounded-2xl border p-5
                      text-left transition
                      hover:-translate-y-0.5
                      ${
                        selected
                          ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.12)]"
                          : "border-white/10 bg-black/20 text-muted-foreground hover:border-white/20 hover:bg-white/[0.04]"
                      }
                    `}
                  >
                    <span
                      className={`
                        mb-4 inline-flex size-10
                        items-center justify-center
                        rounded-xl border
                        ${
                          selected
                            ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-200"
                            : "border-white/10 bg-black/20 text-slate-300"
                        }
                      `}
                    >
                      <ModeIcon size={18} />
                    </span>
                    <span className="block text-sm font-bold">{mode.label}</span>
                    <span className="mt-2 block text-xs leading-5">
                      {mode.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-6 md:grid-cols-[1.4fr,0.6fr]">
              <label className="block space-y-3">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Link2 size={15} className="text-cyan-300" />
                  Target URL
                </span>

                <input
                  value={form.url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      url: e.target.value,
                    })
                  }
                  className={fieldClassName}
                />
              </label>

              <label className="block space-y-3">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <GitBranch size={15} className="text-emerald-300" />
                  HTTP Method
                </span>

                <select
                  value={form.method}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      method: e.target.value,
                    })
                  }
                  className={fieldClassName}
                >
                  <option>GET</option>
                  <option>POST</option>
                </select>
              </label>
            </div>

            {form.mode === "configuration" ? (
              <div className="space-y-5">
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="block space-y-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Activity size={15} className="text-amber-300" />
                      Pattern
                    </span>

                    <select
                      value="stages"
                      disabled
                      className={`${fieldClassName} disabled:opacity-70`}
                    >
                      <option value="stages">Stages</option>
                    </select>
                  </label>

                  <label className="block space-y-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Gauge size={15} className="text-cyan-300" />
                      Concurrency
                    </span>

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
                      className={fieldClassName}
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium">Traffic Stages</p>

                    <button
                      type="button"
                      onClick={addStage}
                      className="
                        inline-flex items-center gap-2
                        rounded-xl border
                        border-emerald-400/20
                        bg-emerald-500/10
                        px-4 py-2 text-sm
                        font-semibold text-emerald-300
                        transition hover:bg-emerald-500/20
                      "
                    >
                      <Plus size={15} />
                      Add Stage
                    </button>
                  </div>

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
                            lg:grid-cols-[auto_1fr_1fr_auto]
                            lg:items-end
                          "
                        >
                          <div
                            className="
                              flex size-12 items-center
                              justify-center rounded-xl
                              border border-cyan-400/20
                              bg-cyan-500/10
                              text-sm font-black text-cyan-200
                              lg:mb-0.5
                            "
                          >
                            {index + 1}
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
                              className={fieldClassName}
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
                              className={fieldClassName}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => removeStage(index)}
                            disabled={form.stages.length === 1}
                            className="
                              inline-flex items-center justify-center
                              gap-2 rounded-xl border
                              border-red-400/20
                              bg-red-500/10 px-4 py-4
                              text-sm font-semibold text-red-300
                              transition hover:bg-red-500/20
                              disabled:opacity-50
                            "
                          >
                            <Trash2 size={15} />
                            Remove
                          </button>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(6, Number(stage.rate || 0)),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-3">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Zap size={15} className="text-amber-300" />
                    Requests / Second
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={form.rps}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rps: Number(e.target.value),
                      })
                    }
                    className={fieldClassName}
                  />
                </label>

                {form.mode === "duration" ? (
                  <label className="block space-y-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Timer size={15} className="text-cyan-300" />
                      Duration (seconds)
                    </span>

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
                      className={fieldClassName}
                    />
                  </label>
                ) : (
                  <label className="block space-y-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <ListChecks size={15} className="text-emerald-300" />
                      Total Requests
                    </span>

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
                      className={fieldClassName}
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        <aside
          className="
            border-t border-white/10
            bg-black/20 p-6
            sm:p-8 xl:border-l xl:border-t-0
          "
        >
          <div className="sticky top-8 space-y-6">
            <div
              className="
                rounded-2xl border border-white/10
                bg-white/[0.03] p-5
              "
            >
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Launch Preview
              </p>

              <div className="mt-5 space-y-4">
                {[
                  ["Mode", activeMode.label],
                  ["Pattern", runPreview.pattern],
                  ["Duration", runPreview.duration],
                  ["Requests", runPreview.requests],
                  ["Peak Rate", runPreview.peakRate],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="
                      flex items-center justify-between
                      gap-4 border-b border-white/10
                      pb-3 last:border-b-0 last:pb-0
                    "
                  >
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-right text-sm font-bold text-slate-100">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error ? (
              <div
                className="
                  rounded-2xl
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
                inline-flex w-full items-center
                justify-center gap-3 rounded-2xl
                bg-cyan-500 px-8 py-4
                font-bold text-black
                transition
                hover:scale-[1.02]
                hover:bg-cyan-400
                disabled:opacity-50
              "
            >
              <Rocket size={18} />
              {loading ? "Starting..." : "Launch Simulation"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
