"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageHeader } from "@/components/shared/PageHeader";
import { clearAuthStorage } from "@/lib/auth-token";
import { api } from "@/lib/api";

const authErrorMessages = new Set([
  "Invalid token",
  "No token provided",
  "User not found",
]);

const isAuthError = (err) => authErrorMessages.has(err?.message);

const getProjectId = (project, index) =>
  project._id || project.id || `project-${index}`;

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const projectCount = projects.length;
  const canCreateProject = name.trim().length > 0 && !loading;

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      ),
    [projects],
  );

  const handleAuthError = useCallback((err) => {
    if (!isAuthError(err)) {
      return false;
    }

    clearAuthStorage();
    router.replace("/login");
    return true;
  }, [router]);

  const loadProjects = useCallback(async ({ silent = false } = {}) => {
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
  }, [handleAuthError]);

  const createProject = async (event) => {
    event.preventDefault();

    const projectName = name.trim();

    if (!projectName) {
      setError("Project name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api("/projects", "POST", {
        name: projectName,
      });

      setName("");
      await loadProjects({ silent: true });
    } catch (err) {
      if (handleAuthError(err)) {
        return;
      }

      setError(err.message || "Unable to create project.");
    } finally {
      setLoading(false);
    }
  };

  const openDashboard = (projectId) => {
    localStorage.setItem("projectId", projectId);
    localStorage.removeItem("currentRunId");
    localStorage.removeItem("currentRunActive");

    const params = new URLSearchParams({ projectId });
    router.push(`/dashboard?${params.toString()}`);
  };

  useEffect(() => {
    loadProjects();
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

          <section className="glass rounded-[32px] p-8">
            <div className="grid gap-8 xl:grid-cols-[1fr,0.9fr] xl:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
                  Project Management
                </p>

                <h2 className="mt-4 text-4xl font-black">Create Project</h2>

                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Provision a focused workspace, then launch simulations from
                  the simulation or dashboard control surfaces.
                </p>
              </div>

              <form onSubmit={createProject} className="flex gap-4">
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
            </div>

            {error ? (
              <div
                className="
                  mt-6 rounded-2xl border
                  border-red-500/20 bg-red-500/5
                  px-5 py-4 text-sm text-red-300
                "
              >
                {error}
              </div>
            ) : null}
          </section>

          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
                  Workspaces
                </p>
                <h2 className="mt-3 text-3xl font-black">
                  My Projects
                </h2>
              </div>

              <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-muted-foreground">
                {projectCount} {projectCount === 1 ? "project" : "projects"}
              </div>
            </div>

            {loadingProjects ? (
              <div className="glass rounded-[28px] p-8 text-center text-muted-foreground">
                Loading projects...
              </div>
            ) : sortedProjects.length === 0 ? (
              <div className="glass rounded-[28px] p-8 text-center text-muted-foreground">
                No projects yet. Create one to start orchestrating simulations.
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {sortedProjects.map((project, index) => {
                  const projectId = getProjectId(project, index);

                  return (
                    <article
                      key={projectId}
                      className="
                        glass rounded-[28px] p-6
                        transition hover:border-cyan-400/30
                      "
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                          <h3 className="truncate text-2xl font-bold">
                            {project.name || "Untitled project"}
                          </h3>

                          <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
                            {projectId}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openDashboard(projectId)}
                          className="
                            shrink-0 rounded-2xl border
                            border-cyan-400/20 bg-cyan-500/10
                            px-5 py-3 text-sm font-semibold
                            text-cyan-300 transition
                            hover:bg-cyan-500/20
                          "
                        >
                          Open Dashboard
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
