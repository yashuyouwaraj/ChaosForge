"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { EmptyState } from "@/components/shared/EmptyState";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WorkspaceSection } from "@/components/shared/WorkspaceSection";
import { useProject } from "@/components/providers/ProjectProvider";
import { useRun } from "@/components/providers/RunProvider";
import { clearAuthStorage } from "@/lib/auth-token";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

const authErrorMessages = new Set([
  "Invalid token",
  "No token provided",
  "User not found",
]);

const comparisonMetrics = [
  ["success", "Success Rate", true],
  ["rps", "RPS", true],
  ["avgLatency", "Avg Latency", false],
  ["p95Latency", "P95 Latency", false],
  ["failureRate", "Failure Rate", false],
];

const isAuthError = (err) => authErrorMessages.has(err?.message);

const getProjectId = (project, index) =>
  project._id || project.id || `project-${index}`;

const getStatusTone = (status) => {
  if (status === "completed") {
    return "success";
  }

  if (status === "failed") {
    return "error";
  }

  return status || "info";
};

const getDeltaTone = (delta, higherIsBetter) => {
  if (Number(delta || 0) === 0) {
    return "text-slate-100";
  }

  const improved = higherIsBetter ? delta > 0 : delta < 0;
  return improved ? "text-emerald-300" : "text-red-300";
};

function ProjectCard({
  project,
  projectId,
  isExpanded,
  runCount,
  latestRun,
  isEditing,
  editName,
  actionLoading,
  onToggle,
  onOpenDashboard,
  onStartEdit,
  onEditNameChange,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}) {
  return (
    <article className="glass overflow-hidden rounded-[28px]">
      <button
        type="button"
        onClick={onToggle}
        className="
          flex w-full cursor-pointer items-center
          justify-between gap-5 p-6 text-left
          transition hover:bg-white/[0.03]
        "
      >
        <div className="min-w-0">
          <h3 className="truncate text-2xl font-bold">
            {project.name || "Untitled project"}
          </h3>

          <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
            {projectId}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {latestRun?.status ? (
            <StatusBadge status={getStatusTone(latestRun.status)}>
              {latestRun.status}
            </StatusBadge>
          ) : null}

          <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-muted-foreground">
            {runCount} runs
          </span>

          <span className="text-xl text-slate-400">
            {isExpanded ? "-" : "+"}
          </span>
        </div>
      </button>

      <div className="border-t border-white/10 px-6 py-4">
        {isEditing ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSaveEdit(projectId);
            }}
            className="mb-4 grid gap-3 md:grid-cols-[1fr,auto,auto]"
          >
            <input
              value={editName}
              onChange={(event) => onEditNameChange(event.target.value)}
              className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm outline-none cf-accent-ring"
              placeholder="Project name"
            />
            <button
              type="submit"
              disabled={actionLoading === projectId}
              className="rounded-2xl cf-accent-bg px-5 py-3 text-sm font-bold text-black transition hover:scale-[1.02] disabled:opacity-50"
            >
              {actionLoading === projectId ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={actionLoading === projectId}
              className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
        ) : null}

        <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onOpenDashboard(projectId, latestRun?.runId)}
          className="
            rounded-2xl border border-cyan-400/20
            bg-cyan-500/10 px-5 py-3
            text-sm font-semibold text-cyan-300
            transition hover:bg-cyan-500/20
          "
        >
          Open Dashboard
        </button>
          <button
            type="button"
            onClick={() => onStartEdit(project)}
            disabled={actionLoading === projectId}
            className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold transition hover:bg-white/5 disabled:opacity-50"
          >
            Edit Name
          </button>
          <button
            type="button"
            onClick={() => onDelete(projectId)}
            disabled={actionLoading === projectId}
            className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {actionLoading === projectId ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function RunHistoryTable({ runs, onOpenDashboard }) {
  if (runs.length === 0) {
    return (
      <EmptyState
        title="No runs yet"
        description="Launch a simulation to start building run history for this project."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left text-sm text-muted-foreground">
            <th className="px-4 py-4">Run ID</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-4 py-4">RPS</th>
            <th className="px-4 py-4">Avg Latency</th>
            <th className="px-4 py-4">Failures</th>
            <th className="px-4 py-4">Success</th>
            <th className="px-4 py-4">Created</th>
            <th className="px-4 py-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {runs.map((run) => (
            <tr key={run.runId} className="border-b border-white/5">
              <td className="max-w-[16rem] truncate px-4 py-5 font-mono text-sm">
                {run.runId}
              </td>
              <td className="px-4 py-5">
                <StatusBadge status={getStatusTone(run.status)}>
                  {run.status || "unknown"}
                </StatusBadge>
              </td>
              <td className="px-4 py-5">{run.rps || 0}</td>
              <td className="px-4 py-5">{run.avgLatency || 0}ms</td>
              <td className="px-4 py-5 text-red-300">{run.failure || 0}</td>
              <td className="px-4 py-5 text-green-300">{run.success || 0}</td>
              <td className="px-4 py-5 text-sm text-muted-foreground">
                {run.createdAt ? new Date(run.createdAt).toLocaleString() : "-"}
              </td>
              <td className="px-4 py-5">
                <button
                  type="button"
                  onClick={() => onOpenDashboard(run.runId)}
                  className="
                    rounded-xl border border-cyan-400/20
                    bg-cyan-500/10 px-4 py-2
                    text-sm font-semibold text-cyan-300
                    transition hover:bg-cyan-500/20
                  "
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonPanel({
  runs,
  selectedRuns,
  comparison,
  comparing,
  error,
  onSelectRun,
  onCompare,
}) {
  if (runs.length < 2) {
    return (
      <EmptyState
        title="Run comparison unavailable"
        description="At least two completed or recorded runs are required for comparison."
      />
    );
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
      <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            Regression Intelligence
          </p>
          <h3 className="mt-3 text-2xl font-black">Run Comparison</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Compare a baseline run against a newer run using the existing
            ChaosForge comparison API.
          </p>

          <div className="mt-5 space-y-3">
            <select
              value={selectedRuns.runA || ""}
              onChange={(event) => onSelectRun("runA", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            >
              <option value="">Select baseline run</option>
              {runs.map((run) => (
                <option key={run.runId} value={run.runId}>
                  {run.runId.slice(0, 8)}... ({run.rps || 0} RPS)
                </option>
              ))}
            </select>

            <select
              value={selectedRuns.runB || ""}
              onChange={(event) => onSelectRun("runB", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            >
              <option value="">Select comparison run</option>
              {runs.map((run) => (
                <option key={run.runId} value={run.runId}>
                  {run.runId.slice(0, 8)}... ({run.rps || 0} RPS)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onCompare}
              disabled={comparing}
              className="
                w-full rounded-xl bg-cyan-500
                px-5 py-3 text-sm font-bold
                text-black transition hover:bg-cyan-400
                disabled:opacity-50
              "
            >
              {comparing ? "Comparing..." : "Compare Runs"}
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </div>

        <div>
          {!comparison ? (
            <EmptyState
              title="Choose two runs"
              description="Select a baseline and comparison run to inspect performance drift."
              className="h-full"
            />
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {comparisonMetrics.map(([key, label, higherIsBetter]) => {
                  const delta = Number(comparison?.deltas?.[key] || 0);

                  return (
                    <MetricCard
                      key={key}
                      label={label}
                      value={`${delta > 0 ? "+" : ""}${delta}%`}
                      subtext={comparison?.trends?.[key] || "same"}
                      valueClassName={getDeltaTone(delta, higherIsBetter)}
                      className="bg-white/[0.03]"
                    />
                  );
                })}
              </div>

              {comparison?.insights?.length > 0 ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
                  <p className="text-sm font-semibold text-amber-300">
                    Key Insights
                  </p>
                  <ul className="mt-3 space-y-2">
                    {comparison.insights.map((insight, index) => (
                      <li
                        key={`${insight}-${index}`}
                        className="text-sm leading-6 text-slate-200"
                      >
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { projectId: selectedProjectId, setProjectId } = useProject();
  const { selectedRun, setSelectedRun } = useRun();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [runs, setRuns] = useState({});
  const [selectedRuns, setSelectedRuns] = useState({ runA: "", runB: "" });
  const [comparison, setComparison] = useState(null);
  const [comparisonError, setComparisonError] = useState("");
  const [comparing, setComparing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [projectActionLoading, setProjectActionLoading] = useState("");

  const projectCount = projects.length;
  const canCreateProject = name.trim().length > 0 && !loading;

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      ),
    [projects],
  );

  const handleAuthError = useCallback(
    (err) => {
      if (!isAuthError(err)) {
        return false;
      }

      clearAuthStorage();
      router.replace("/login");
      return true;
    },
    [router],
  );

  const loadProjects = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoadingProjects(true);
        }

        const data = await api("/projects");
        setProjects(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        if (handleAuthError(err)) {
          return;
        }

        setError(err.message || "Unable to load projects.");
      } finally {
        if (!silent) {
          setLoadingProjects(false);
        }
      }
    },
    [handleAuthError],
  );

  const fetchRuns = useCallback(
    async (projectId) => {
      try {
        const data = await api(`/runs/${projectId}`);
        setRuns((prev) => ({
          ...prev,
          [projectId]: Array.isArray(data) ? data : [],
        }));
      } catch (err) {
        if (handleAuthError(err)) {
          return;
        }

        setError(err.message || "Unable to load project runs.");
        setRuns((prev) => ({
          ...prev,
          [projectId]: [],
        }));
      }
    },
    [handleAuthError],
  );

  const createProject = async (event) => {
    event.preventDefault();

    const projectName = name.trim();

    if (!projectName) {
      setError("Project name is required.");
      setErrorDetails(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setErrorDetails(null);

      await api("/projects", "POST", {
        name: projectName,
      });

      setName("");
      await loadProjects({ silent: true });
      toast.success("Project created successfully.");
    } catch (err) {
      if (handleAuthError(err)) {
        return;
      }

      setError(err.message || "Unable to create project.");
      setErrorDetails(err.details || null);
      toast.error("Something went wrong", err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startEditProject = (project) => {
    const projectId = project._id || project.id;

    setEditingProjectId(projectId);
    setEditingProjectName(project.name || "");
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setEditingProjectName("");
  };

  const updateProject = async (projectId) => {
    const nextName = editingProjectName.trim();

    if (!nextName) {
      setError("Project name is required.");
      return;
    }

    try {
      setProjectActionLoading(projectId);
      setError("");

      await api(`/projects/${projectId}`, "PATCH", {
        name: nextName,
      });

      cancelEditProject();
      await loadProjects({ silent: true });
      window.dispatchEvent(new Event("chaosforge:projects-changed"));
      toast.success("Project updated.");
    } catch (err) {
      if (handleAuthError(err)) {
        return;
      }

      setError(err.message || "Unable to update project.");
      toast.error("Something went wrong", err.message || "Please try again.");
    } finally {
      setProjectActionLoading("");
    }
  };

  const deleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Delete this project and all associated simulation data?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setProjectActionLoading(projectId);
      setError("");

      await api(`/projects/${projectId}`, "DELETE");

      setProjects((current) =>
        current.filter((project, index) => getProjectId(project, index) !== projectId),
      );
      setRuns((current) => {
        const nextRuns = { ...current };
        delete nextRuns[projectId];
        return nextRuns;
      });
      setExpandedProject((current) => (current === projectId ? null : current));
      setComparison(null);
      setComparisonError("");
      setSelectedRuns({ runA: "", runB: "" });

      if (editingProjectId === projectId) {
        cancelEditProject();
      }

      if (selectedProjectId === projectId) {
        setProjectId(null);
        localStorage.removeItem("projectId");
      }

      if (selectedRun?.projectId === projectId) {
        setSelectedRun({
          projectId: null,
          runId: null,
          status: null,
        });
        localStorage.removeItem("currentRunId");
        localStorage.removeItem("currentRunActive");
      }

      await loadProjects({ silent: true });
      window.dispatchEvent(new Event("chaosforge:projects-changed"));
      toast.success("Project deleted.");
    } catch (err) {
      if (handleAuthError(err)) {
        return;
      }

      setError(err.message || "Unable to delete project.");
      toast.error("Something went wrong", err.message || "Please try again.");
    } finally {
      setProjectActionLoading("");
    }
  };

  const toggleProject = async (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
      return;
    }

    setExpandedProject(projectId);
    setComparison(null);
    setComparisonError("");
    setSelectedRuns({ runA: "", runB: "" });

    if (!runs[projectId]) {
      await fetchRuns(projectId);
    }
  };

  const openDashboard = (projectId, runId = "") => {
    setProjectId(projectId);
    setSelectedRun({
      projectId,
      runId: runId || null,
      status: null,
    });

    localStorage.setItem("projectId", projectId);

    if (runId) {
      localStorage.setItem("currentRunId", runId);
    } else {
      localStorage.removeItem("currentRunId");
    }

    localStorage.removeItem("currentRunActive");

    const params = new URLSearchParams({
      projectId,
      ...(runId && { runId }),
    });

    router.push(`/dashboard?${params.toString()}`);
  };

  const compareRuns = async () => {
    if (!selectedRuns.runA || !selectedRuns.runB) {
      setComparisonError("Select two runs to compare.");
      return;
    }

    if (selectedRuns.runA === selectedRuns.runB) {
      setComparisonError("Select two different runs.");
      return;
    }

    try {
      setComparing(true);
      setComparisonError("");

      const data = await api(
        `/runs/compare?runA=${selectedRuns.runA}&runB=${selectedRuns.runB}`,
      );

      setComparison(data);
    } catch (err) {
      if (handleAuthError(err)) {
        return;
      }

      setComparison(null);
      setComparisonError(err.message || "Failed to compare runs.");
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const handleProjectsChanged = () => {
      loadProjects({ silent: true });
    };

    window.addEventListener("chaosforge:projects-changed", handleProjectsChanged);
    return () =>
      window.removeEventListener(
        "chaosforge:projects-changed",
        handleProjectsChanged,
      );
  }, [loadProjects]);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-10">
          <PageHeader
            eyebrow="Infrastructure workloads"
            title="Projects Workspace"
            description="Create and select infrastructure workspaces for simulation orchestration, telemetry, and dashboards."
          />

          <WorkspaceSection
            eyebrow="Project Management"
            title="Create Project"
            description="Provision a focused workspace, then launch simulations from the simulation or dashboard control surfaces."
          >
            <form onSubmit={createProject} className="flex max-w-3xl gap-4">
              <input
                placeholder="Project name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="
                  h-14 min-w-0 flex-1 rounded-2xl
                  border border-white/10 bg-black/20
                  px-5 outline-none transition
                  focus:border-cyan-400/60
                "
              />

              <button
                type="submit"
                disabled={!canCreateProject}
                className="
                  rounded-2xl bg-cyan-500
                  px-8 font-bold text-black
                  transition hover:scale-[1.02]
                  hover:bg-cyan-400
                  disabled:opacity-50
                "
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </form>

            {error ? (
              errorDetails?.currentPlan ? (
                <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-amber-300">Project Limit Reached</p>
                    <p className="mt-2 text-sm text-slate-200">
                      Your <span className="font-semibold capitalize">{errorDetails.currentPlan}</span> plan supports up to <span className="font-semibold">{errorDetails.currentLimit} projects</span>. You have already created <span className="font-semibold">{errorDetails.currentProjects}</span>.
                    </p>
                  </div>

                  <div className="pt-2 space-y-3 border-t border-amber-500/10">
                    <p className="text-sm text-slate-300">Upgrade to <span className="font-semibold">Pro</span> to unlock:</p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span><span className="font-semibold">{errorDetails.proLimit} projects</span> instead of {errorDetails.currentLimit}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span><span className="font-semibold">10x higher RPS</span> limits (10,000 vs 100)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span><span className="font-semibold">12x longer duration</span> (1 hour vs 5 minutes)</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => router.push("/billing")}
                    className="
                      w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500
                      hover:from-amber-600 hover:to-orange-600
                      text-white font-semibold py-2 px-4
                      rounded-lg transition
                    "
                  >
                    Upgrade to Pro
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-300">
                  {error}
                </div>
              )
            ) : null}
          </WorkspaceSection>

          <WorkspaceSection
            eyebrow="Workspaces"
            title="My Projects"
            description="Open a project to inspect its run history, compare runs, or jump into the realtime dashboard."
            headerAction={
              <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-muted-foreground">
                {projectCount} {projectCount === 1 ? "project" : "projects"}
              </div>
            }
          >
            {loadingProjects ? (
              <EmptyState
                title="Loading projects"
                description="Fetching your infrastructure workspaces."
              />
            ) : sortedProjects.length === 0 ? (
              <EmptyState
                title="No projects yet"
                description="Create one to start orchestrating simulations."
              />
            ) : (
              <div className="space-y-5">
                {sortedProjects.map((project, index) => {
                  const projectId = getProjectId(project, index);
                  const projectRuns = runs[projectId] || [];
                  const latestRun = projectRuns[0];
                  const isExpanded = expandedProject === projectId;

                  return (
                    <div key={projectId} className="space-y-5">
                      <ProjectCard
                        project={project}
                        projectId={projectId}
                        isExpanded={isExpanded}
                        runCount={projectRuns.length}
                        latestRun={latestRun}
                        isEditing={editingProjectId === projectId}
                        editName={editingProjectName}
                        actionLoading={projectActionLoading}
                        onToggle={() => toggleProject(projectId)}
                        onOpenDashboard={openDashboard}
                        onStartEdit={startEditProject}
                        onEditNameChange={setEditingProjectName}
                        onCancelEdit={cancelEditProject}
                        onSaveEdit={updateProject}
                        onDelete={deleteProject}
                      />

                      {isExpanded ? (
                        <div className="space-y-5 rounded-[28px] border border-white/10 bg-black/10 p-5">
                          <RunHistoryTable
                            runs={projectRuns}
                            onOpenDashboard={(runId) =>
                              openDashboard(projectId, runId)
                            }
                          />

                          <ComparisonPanel
                            runs={projectRuns}
                            selectedRuns={selectedRuns}
                            comparison={comparison}
                            comparing={comparing}
                            error={comparisonError}
                            onSelectRun={(field, value) =>
                              setSelectedRuns((prev) => ({
                                ...prev,
                                [field]: value,
                              }))
                            }
                            onCompare={compareRuns}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </WorkspaceSection>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
