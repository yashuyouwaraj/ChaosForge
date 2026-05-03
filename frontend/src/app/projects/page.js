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
  const [comparison, setComparison] = useState(null);
  const [selectedRuns, setSelectedRuns] = useState({ runA: null, runB: null });

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

  const compareRuns = async (runA, runB) => {
    try {
      if (!runA || !runB) {
        setError("Please select two runs to compare");
        return;
      }

      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/runs/compare?runA=${runA}&runB=${runB}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const comparisonData = await res.json();
      setComparison(comparisonData);
      setError("");
    } catch (err) {
      console.error("Failed to compare runs:", err);
      setError("Failed to compare runs: " + err.message);
      setComparison(null);
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

                          {/* Error Types */}
                          {run.errorTypes && (
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <p className="text-xs font-semibold text-gray-400 mb-2">Error Breakdown:</p>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="bg-red-500/10 p-2 rounded">
                                  <span className="text-gray-400">Timeout:</span>
                                  <div className="text-red-400 font-bold">{run.errorTypes.timeout || 0}</div>
                                </div>
                                <div className="bg-orange-500/10 p-2 rounded">
                                  <span className="text-gray-400">Network:</span>
                                  <div className="text-orange-400 font-bold">{run.errorTypes.network || 0}</div>
                                </div>
                                <div className="bg-yellow-500/10 p-2 rounded">
                                  <span className="text-gray-400">Server:</span>
                                  <div className="text-yellow-400 font-bold">{run.errorTypes.server || 0}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Latency Buckets */}
                          {run.latencyBuckets && (
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <p className="text-xs font-semibold text-gray-400 mb-2">Latency Distribution:</p>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div className="bg-green-500/10 p-2 rounded">
                                  <span className="text-gray-400 block">0-500ms</span>
                                  <div className="text-green-400 font-bold">{run.latencyBuckets["0-500"] || 0}</div>
                                </div>
                                <div className="bg-blue-500/10 p-2 rounded">
                                  <span className="text-gray-400 block">500-1s</span>
                                  <div className="text-blue-400 font-bold">{run.latencyBuckets["500-1000"] || 0}</div>
                                </div>
                                <div className="bg-yellow-500/10 p-2 rounded">
                                  <span className="text-gray-400 block">1-2s</span>
                                  <div className="text-yellow-400 font-bold">{run.latencyBuckets["1000-2000"] || 0}</div>
                                </div>
                                <div className="bg-red-500/10 p-2 rounded">
                                  <span className="text-gray-400 block">2s+</span>
                                  <div className="text-red-400 font-bold">{run.latencyBuckets["2000+"] || 0}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-600">
                            {new Date(run.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {projectRuns.length > 1 && (
                    <div className="mt-6 pt-6 border-t border-gray-600">
                      <h3 className="font-semibold mb-3">Compare Runs:</h3>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <select
                          value={selectedRuns.runA || ""}
                          onChange={(e) =>
                            setSelectedRuns((prev) => ({
                              ...prev,
                              runA: e.target.value,
                            }))
                          }
                          className="px-3 py-2 bg-gray-800 text-gray-100 rounded text-sm border border-gray-600 hover:border-gray-500 focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                          <option value="">Select baseline run</option>
                          {projectRuns.map((run) => (
                            <option key={run.runId} value={run.runId}>
                              {run.runId.slice(0, 8)}... ({run.rps} RPS)
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedRuns.runB || ""}
                          onChange={(e) =>
                            setSelectedRuns((prev) => ({
                              ...prev,
                              runB: e.target.value,
                            }))
                          }
                          className="px-3 py-2 bg-gray-800 text-gray-100 rounded text-sm border border-gray-600 hover:border-gray-500 focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                          <option value="">Select compare run</option>
                          {projectRuns.map((run) => (
                            <option key={run.runId} value={run.runId}>
                              {run.runId.slice(0, 8)}... ({run.rps} RPS)
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() =>
                            compareRuns(selectedRuns.runA, selectedRuns.runB)
                          }
                          className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700"
                        >
                          Compare
                        </button>
                      </div>

                      {comparison && (
                        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-lg mt-4 border border-blue-500/20">
                          <h3 className="text-lg font-bold mb-6 text-blue-200">📊 Performance Comparison</h3>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-3">
                            {/* Success */}
                            <div className="bg-white/5 p-4 rounded border border-white/10 hover:border-blue-500/30 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Success Rate</span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    comparison.trends.success === "improvement"
                                      ? "bg-green-500/20 text-green-300"
                                      : comparison.trends.success === "degraded"
                                        ? "bg-red-500/20 text-red-300"
                                        : "bg-gray-500/20 text-gray-300"
                                  }`}
                                >
                                  {comparison.trends.success === "improvement"
                                    ? "📈 Better"
                                    : comparison.trends.success === "degraded"
                                      ? "📉 Worse"
                                      : "➡️ Same"}
                                </span>
                              </div>
                              <div
                                className={`text-2xl font-bold ${
                                  comparison.deltas.success > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {comparison.deltas.success > 0 ? "+" : ""}
                                {comparison.deltas.success}%
                              </div>
                            </div>

                            {/* RPS */}
                            <div className="bg-white/5 p-4 rounded border border-white/10 hover:border-blue-500/30 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">RPS</span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    comparison.trends.rps === "improvement"
                                      ? "bg-green-500/20 text-green-300"
                                      : comparison.trends.rps === "degraded"
                                        ? "bg-red-500/20 text-red-300"
                                        : "bg-gray-500/20 text-gray-300"
                                  }`}
                                >
                                  {comparison.trends.rps === "improvement"
                                    ? "📈 Better"
                                    : comparison.trends.rps === "degraded"
                                      ? "📉 Worse"
                                      : "➡️ Same"}
                                </span>
                              </div>
                              <div
                                className={`text-2xl font-bold ${
                                  comparison.deltas.rps > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {comparison.deltas.rps > 0 ? "+" : ""}
                                {comparison.deltas.rps}%
                              </div>
                            </div>

                            {/* Avg Latency */}
                            <div className="bg-white/5 p-4 rounded border border-white/10 hover:border-blue-500/30 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Avg Latency</span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    comparison.trends.avgLatency === "improvement"
                                      ? "bg-green-500/20 text-green-300"
                                      : comparison.trends.avgLatency === "degraded"
                                        ? "bg-red-500/20 text-red-300"
                                        : "bg-gray-500/20 text-gray-300"
                                  }`}
                                >
                                  {comparison.trends.avgLatency === "improvement"
                                    ? "📈 Better"
                                    : comparison.trends.avgLatency === "degraded"
                                      ? "📉 Worse"
                                      : "➡️ Same"}
                                </span>
                              </div>
                              <div
                                className={`text-2xl font-bold ${
                                  comparison.deltas.avgLatency < 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {comparison.deltas.avgLatency < 0 ? "" : "+"}
                                {comparison.deltas.avgLatency}%
                              </div>
                            </div>

                            {/* P95 Latency */}
                            <div className="bg-white/5 p-4 rounded border border-white/10 hover:border-blue-500/30 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">P95 Latency</span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    comparison.trends.p95Latency === "improvement"
                                      ? "bg-green-500/20 text-green-300"
                                      : comparison.trends.p95Latency === "degraded"
                                        ? "bg-red-500/20 text-red-300"
                                        : "bg-gray-500/20 text-gray-300"
                                  }`}
                                >
                                  {comparison.trends.p95Latency === "improvement"
                                    ? "📈 Better"
                                    : comparison.trends.p95Latency === "degraded"
                                      ? "📉 Worse"
                                      : "➡️ Same"}
                                </span>
                              </div>
                              <div
                                className={`text-2xl font-bold ${
                                  comparison.deltas.p95Latency < 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {comparison.deltas.p95Latency < 0 ? "" : "+"}
                                {comparison.deltas.p95Latency}%
                              </div>
                            </div>

                            {/* Failure Rate */}
                            <div className="bg-white/5 p-4 rounded border border-white/10 hover:border-blue-500/30 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Failure Rate</span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    comparison.trends.failureRate === "improvement"
                                      ? "bg-green-500/20 text-green-300"
                                      : comparison.trends.failureRate === "degraded"
                                        ? "bg-red-500/20 text-red-300"
                                        : "bg-gray-500/20 text-gray-300"
                                  }`}
                                >
                                  {comparison.trends.failureRate === "improvement"
                                    ? "📈 Better"
                                    : comparison.trends.failureRate === "degraded"
                                      ? "📉 Worse"
                                      : "➡️ Same"}
                                </span>
                              </div>
                              <div
                                className={`text-2xl font-bold ${
                                  comparison.deltas.failureRate < 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {comparison.deltas.failureRate < 0 ? "" : "+"}
                                {comparison.deltas.failureRate}%
                              </div>
                            </div>
                          </div>

                          {/* Insights Section */}
                          {comparison.insights.length > 0 && (
                            <div className="bg-white/5 p-4 rounded border border-white/10">
                              <h4 className="text-sm font-bold text-yellow-300 mb-3">💡 Key Insights</h4>
                              <ul className="space-y-2">
                                {comparison.insights.map((insight, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start text-sm text-gray-300"
                                  >
                                    <span className="mr-2 text-yellow-400 flex-shrink-0">
                                      ✓
                                    </span>
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
