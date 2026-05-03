"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { getBaseUrl } from "../../lib/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState({});
  const [expandedProject, setExpandedProject] = useState(null);

  const createProject = async () => {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api("/projects", "POST", { name });
      const data = await api("/projects");
      setProjects(data);
      setName("");
    } catch (err) {
      setError(err.message || "Unable to create project.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRuns = async (projectId) => {
    try {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/runs/${projectId}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const runsData = await res.json();
      setRuns((prev) => ({ ...prev, [projectId]: runsData }));
    } catch (err) {
      console.error("Failed to fetch runs:", err);
      setRuns((prev) => ({ ...prev, [projectId]: [] }));
    }
  };

  const toggleProjectRuns = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
      if (!runs[projectId]) {
        fetchRuns(projectId);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadProjects = async () => {
      const data = await api("/projects");

      if (!ignore) {
        setProjects(data);
      }
    };

    loadProjects();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">My Projects</h1>

      <input
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-2 mr-2"
      />

      <button onClick={createProject} disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>

      {error ? <p className="mt-3 text-red-400">{error}</p> : null}

      <div className="mt-6">
        {projects.map((p, index) => {
          const projectId = p._id || p.id || `project-${index}`;
          const projectRuns = runs[projectId] || [];
          const isExpanded = expandedProject === projectId;

          return (
            <div key={projectId}>
              <div
                className="p-4 bg-white/10 mb-2 cursor-pointer hover:bg-white/20 flex justify-between items-center"
                onClick={() => {
                  toggleProjectRuns(projectId);
                }}
              >
                <span>{p.name}</span>
                <span className="text-sm">{isExpanded ? "▼" : "▶"}</span>
              </div>

              {isExpanded && (
                <div className="pl-6 bg-white/5 mb-2 p-4 rounded">
                  <h3 className="font-semibold mb-3">Run History:</h3>
                  {projectRuns.length === 0 ? (
                    <p className="text-gray-400">No runs yet</p>
                  ) : (
                    <div className="space-y-2">
                      {projectRuns.map((run) => (
                        <div key={run.runId} className="p-3 bg-white/10 rounded text-sm space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-gray-400">Run ID:</span>
                            <span className="text-xs font-mono text-gray-300 break-all">{run.runId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Requests:</span>
                            <span className="font-semibold">{run.totalRequests || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Success:</span>
                            <span className="text-green-400">{run.success || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Failure:</span>
                            <span className="text-red-400">{run.failure || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Latency:</span>
                            <span>{run.avgLatency || 0}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>P95 Latency:</span>
                            <span>{run.p95Latency || 0}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>RPS:</span>
                            <span>{run.rps || 0}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                            {new Date(run.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      localStorage.setItem("projectId", projectId);
                      window.location.href = "/";
                    }}
                    className="mt-3 px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
                  >
                    Load Project
                  </button>
                </div>
              )}

              {!isExpanded && (
                <div
                  className="p-4 bg-white/10 mb-2 cursor-pointer hover:bg-white/20 text-sm text-gray-400"
                  onClick={() => {
                    localStorage.setItem("projectId", projectId);
                    window.location.href = "/";
                  }}
                >
                  Click to load project
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
