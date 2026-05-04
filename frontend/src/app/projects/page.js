"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState({});
  const [expandedProject, setExpandedProject] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [selectedRuns, setSelectedRuns] = useState({ runA: null, runB: null });
  const [testUrl, setTestUrl] = useState("");
  const [testConfig, setTestConfig] = useState({
    pattern: "stages",
    concurrency: 20,
    stages: [
      { durationSec: 10, rate: 10 },
      { durationSec: 10, rate: 50 },
      { durationSec: 10, rate: 100 },
      { durationSec: 10, rate: 50 },
      { durationSec: 10, rate: 10 },
    ],
  });

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
      const runsData = await api(`/runs/${projectId}`);
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

      const comparisonData = await api(
        `/runs/compare?runA=${runA}&runB=${runB}`,
      );
      setComparison(comparisonData);
      setError("");
    } catch (err) {
      console.error("Failed to compare runs:", err);
      setError("Failed to compare runs: " + err.message);
      setComparison(null);
    }
  };

  const openDashboard = (projectId, runId = "") => {
    localStorage.setItem("projectId", projectId);
    if (runId) {
      localStorage.setItem("currentRunId", runId);
    } else {
      localStorage.removeItem("currentRunId");
    }
    window.location.href = "/";
  };

  const runTest = async (projectId) => {
    if (!testUrl.trim()) {
      setError("Test URL is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await api(`/test/${projectId}`, "POST", {
        url: testUrl,
        config: testConfig,
      });
      await fetchRuns(projectId);
      openDashboard(projectId, data.runId);
    } catch (err) {
      setError(err.message || "Failed to start test");
    } finally {
      setLoading(false);
    }
  };

  const updateStage = (index, field, value) => {
    const newStages = [...testConfig.stages];
    newStages[index][field] = parseInt(value) || 0;
    setTestConfig({ ...testConfig, stages: newStages });
  };

  const addStage = () => {
    setTestConfig({
      ...testConfig,
      stages: [...testConfig.stages, { durationSec: 10, rate: 10 }],
    });
  };

  const removeStage = (index) => {
    const newStages = testConfig.stages.filter((_, i) => i !== index);
    setTestConfig({ ...testConfig, stages: newStages });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-slate-100">My Projects</h1>

        <div className="flex gap-3 mb-8">
          <input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />

          <button onClick={createProject} disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>

        {error ? <p className="mb-6 p-4 bg-red-900/30 border border-red-700 text-red-200 rounded-lg">{error}</p> : null}

        <div className="space-y-4">
          {projects.map((p, index) => {
            const projectId = p._id || p.id || `project-${index}`;
            const projectRuns = runs[projectId] || [];
            const isExpanded = expandedProject === projectId;

            return (
              <div key={projectId}>
                <div
                  className="p-5 bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700 hover:border-slate-600 mb-2 cursor-pointer hover:shadow-lg transition-all duration-300 flex justify-between items-center rounded-lg"
                  onClick={() => {
                    toggleProjectRuns(projectId);
                  }}
                >
                  <span className="text-lg font-semibold text-slate-100">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDashboard(projectId, projectRuns[0]?.runId);
                      }}
                      className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm font-medium transition-colors"
                    >
                      Open Dashboard
                    </button>
                    <span className="text-slate-400 transition-transform duration-300">{isExpanded ? "▼" : "▶"}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pl-6 mb-4 p-6 bg-slate-800/40 border border-slate-700 rounded-lg">
                    {/* Test Configuration */}
                    <div className="mb-8 p-7 bg-gradient-to-br from-slate-800 to-slate-700/50 border border-slate-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <h3 className="font-semibold mb-4 text-slate-100">Start New Test</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Test URL</label>
                        <input
                          type="url"
                          value={testUrl}
                          onChange={(e) => setTestUrl(e.target.value)}
                          placeholder="https://example.com/api"
                          className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-1">Pattern</label>
                          <select
                            value={testConfig.pattern}
                            onChange={(e) => setTestConfig({ ...testConfig, pattern: e.target.value })}
                            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                          >
                            <option value="stages">Stages</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-1">Concurrency (max in-flight)</label>
                          <input
                            type="number"
                            value={testConfig.concurrency}
                            onChange={(e) => setTestConfig({ ...testConfig, concurrency: parseInt(e.target.value) || 20 })}
                            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">Stages</label>
                        <div className="space-y-2">
                          {testConfig.stages.map((stage, index) => (
                            <div key={index} className="grid gap-3 bg-slate-700/30 p-3 rounded-md border border-slate-600 md:grid-cols-[auto_1fr_1fr_auto] md:items-end">
                              <div className="text-slate-200 text-sm font-medium md:pb-2">Stage {index + 1}</div>
                              <label className="block">
                                <span className="mb-1 block text-xs font-medium text-slate-300">Duration (seconds)</span>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Duration"
                                  value={stage.durationSec}
                                  onChange={(e) => updateStage(index, 'durationSec', e.target.value)}
                                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                                />
                              </label>
                              <label className="block">
                                <span className="mb-1 block text-xs font-medium text-slate-300">Rate (requests/sec)</span>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Rate"
                                  value={stage.rate}
                                  onChange={(e) => updateStage(index, 'rate', e.target.value)}
                                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                                />
                              </label>
                              <button
                                onClick={() => removeStage(index)}
                                className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors text-sm font-medium"
                              >
                                Remove
                              </button>
                              <p className="text-xs text-slate-400 md:col-start-2 md:col-span-3">
                                Sends {stage.rate || 0} requests per second for {stage.durationSec || 0} seconds.
                              </p>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={addStage}
                          className="mt-2 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded transition-colors font-medium"
                        >
                          Add Stage
                        </button>
                      </div>
                      <button
                        onClick={() => runTest(projectId)}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-md transition-all duration-300 disabled:opacity-50 shadow-lg"
                      >
                        {loading ? "Starting Test..." : "Start Test"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="order-2">
                    <h3 className="font-semibold mb-3 text-slate-100">Run History:</h3>
                  {projectRuns.length === 0 ? (
                    <p className="text-slate-400">No runs yet</p>
                  ) : (
                    <div className="space-y-3">
                      {projectRuns.map((run) => (
                        <div
                          key={run.runId}
                          className="p-4 bg-slate-700/30 rounded-lg text-sm space-y-2 border border-slate-600"
                        >
                          <div className="flex justify-between items-start border-b border-slate-600 pb-2">
                            <span className="text-xs text-slate-400">
                              Run ID:
                            </span>
                            <span className="text-xs font-mono text-slate-300 break-all">
                              {run.runId}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-200">
                            <span>Total Requests:</span>
                            <span className="font-semibold text-slate-100">
                              {run.totalRequests || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-200">
                            <span>Success:</span>
                            <span className="text-emerald-400 font-semibold">
                              {run.success || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-200">
                            <span>Failure:</span>
                            <span className="text-red-400 font-semibold">
                              {run.failure || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-200">
                            <span>Avg Latency:</span>
                            <span className="text-slate-100">{run.avgLatency || 0}ms</span>
                          </div>
                          <div className="flex justify-between text-slate-200">
                            <span>P95 Latency:</span>
                            <span className="text-slate-100">{run.p95Latency || 0}ms</span>
                          </div>
                          <div className="flex justify-between text-slate-200">
                            <span>RPS:</span>
                            <span className="text-slate-100 font-semibold">{run.rps || 0}</span>
                          </div>

                          {/* Error Types */}
                          {run.errorTypes && (
                            <div className="mt-3 pt-3 border-t border-slate-600">
                              <p className="text-xs font-semibold text-slate-300 mb-2">
                                Error Breakdown:
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="bg-red-900/30 p-2 rounded border border-red-700/50">
                                  <span className="text-slate-400">
                                    Timeout:
                                  </span>
                                  <div className="text-red-400 font-bold">
                                    {run.errorTypes.timeout || 0}
                                  </div>
                                </div>
                                <div className="bg-orange-900/30 p-2 rounded border border-orange-700/50">
                                  <span className="text-slate-400">
                                    Network:
                                  </span>
                                  <div className="text-orange-400 font-bold">
                                    {run.errorTypes.network || 0}
                                  </div>
                                </div>
                                <div className="bg-yellow-900/30 p-2 rounded border border-yellow-700/50">
                                  <span className="text-slate-400">Server:</span>
                                  <div className="text-yellow-400 font-bold">
                                    {run.errorTypes.server || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Latency Buckets */}
                          {run.latencyBuckets && (
                            <div className="mt-3 pt-3 border-t border-slate-600">
                              <p className="text-xs font-semibold text-slate-300 mb-2">
                                Latency Distribution:
                              </p>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div className="bg-emerald-900/30 p-2 rounded border border-emerald-700/50">
                                  <span className="text-slate-400 block">
                                    0-500ms
                                  </span>
                                  <div className="text-emerald-400 font-bold">
                                    {run.latencyBuckets["0-500"] || 0}
                                  </div>
                                </div>
                                <div className="bg-blue-900/30 p-2 rounded border border-blue-700/50">
                                  <span className="text-slate-400 block">
                                    500-1s
                                  </span>
                                  <div className="text-blue-400 font-bold">
                                    {run.latencyBuckets["500-1000"] || 0}
                                  </div>
                                </div>
                                <div className="bg-yellow-900/30 p-2 rounded border border-yellow-700/50">
                                  <span className="text-slate-400 block">
                                    1-2s
                                  </span>
                                  <div className="text-yellow-400 font-bold">
                                    {run.latencyBuckets["1000-2000"] || 0}
                                  </div>
                                </div>
                                <div className="bg-red-900/30 p-2 rounded border border-red-700/50">
                                  <span className="text-slate-400 block">
                                    2s+
                                  </span>
                                  <div className="text-red-400 font-bold">
                                    {run.latencyBuckets["2000+"] || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-600">
                            {new Date(run.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                    </div>
                  {projectRuns.length > 1 && (
                    <div className="order-1 mb-6 pb-6 border-b border-slate-600">
                      <h3 className="font-semibold mb-3 text-slate-100">Compare Runs:</h3>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <select
                          value={selectedRuns.runA || ""}
                          onChange={(e) =>
                            setSelectedRuns((prev) => ({
                              ...prev,
                              runA: e.target.value,
                            }))
                          }
                          className="px-3 py-2 bg-slate-700 text-slate-100 rounded text-sm border border-slate-600 hover:border-slate-500 focus:border-cyan-500 focus:outline-none cursor-pointer transition-colors"
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
                          className="px-3 py-2 bg-slate-700 text-slate-100 rounded text-sm border border-slate-600 hover:border-slate-500 focus:border-cyan-500 focus:outline-none cursor-pointer transition-colors"
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
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm font-medium transition-colors"
                        >
                          Compare
                        </button>
                      </div>

                      {comparison && (
                        <div className="bg-slate-800/40 p-6 rounded-lg mt-4 border border-slate-700">
                          <h3 className="text-lg font-bold mb-6 text-cyan-300">
                            📊 Performance Comparison
                          </h3>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-3">
                            {/* Success */}
                            <div className="bg-slate-700/50 p-4 rounded border border-slate-600 hover:border-slate-500 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">
                                  Success Rate
                                </span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    comparison.trends.success === "improvement"
                                      ? "bg-emerald-900/50 text-emerald-300"
                                      : comparison.trends.success === "degraded"
                                        ? "bg-red-900/50 text-red-300"
                                        : "bg-slate-600/50 text-slate-300"
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
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {comparison.deltas.success > 0 ? "+" : ""}
                                {comparison.deltas.success}%
                              </div>
                            </div>

                            {/* RPS */}
                            <div className="bg-slate-700/50 p-4 rounded border border-slate-600 hover:border-slate-500 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">
                                  RPS
                                </span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    comparison.trends.rps === "improvement"
                                      ? "bg-emerald-900/50 text-emerald-300"
                                      : comparison.trends.rps === "degraded"
                                        ? "bg-red-900/50 text-red-300"
                                        : "bg-slate-600/50 text-slate-300"
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
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {comparison.deltas.rps > 0 ? "+" : ""}
                                {comparison.deltas.rps}%
                              </div>
                            </div>

                            {/* Avg Latency */}
                            <div className="bg-slate-700/50 p-4 rounded border border-slate-600 hover:border-slate-500 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">
                                  Avg Latency
                                </span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    comparison.trends.avgLatency ===
                                    "improvement"
                                      ? "bg-emerald-900/50 text-emerald-300"
                                      : comparison.trends.avgLatency ===
                                          "degraded"
                                        ? "bg-red-900/50 text-red-300"
                                        : "bg-slate-600/50 text-slate-300"
                                  }`}
                                >
                                  {comparison.trends.avgLatency ===
                                  "improvement"
                                    ? "📈 Better"
                                    : comparison.trends.avgLatency ===
                                        "degraded"
                                      ? "📉 Worse"
                                      : "➡️ Same"}
                                </span>
                              </div>
                              <div
                                className={`text-2xl font-bold ${
                                  comparison.deltas.avgLatency < 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {comparison.deltas.avgLatency < 0 ? "" : "+"}
                                {comparison.deltas.avgLatency}%
                              </div>
                            </div>

                            {/* P95 Latency */}
                            <div className="bg-slate-700/50 p-4 rounded border border-slate-600 hover:border-slate-500 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">
                                  P95 Latency
                                </span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    comparison.trends.p95Latency ===
                                    "improvement"
                                      ? "bg-emerald-900/50 text-emerald-300"
                                      : comparison.trends.p95Latency ===
                                          "degraded"
                                        ? "bg-red-900/50 text-red-300"
                                        : "bg-slate-600/50 text-slate-300"
                                  }`}
                                >
                                  {comparison.trends.p95Latency ===
                                  "improvement"
                                    ? "📈 Better"
                                    : comparison.trends.p95Latency ===
                                        "degraded"
                                      ? "📉 Worse"
                                      : "➡️ Same"}
                                </span>
                              </div>
                              <div
                                className={`text-2xl font-bold ${
                                  comparison.deltas.p95Latency < 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {comparison.deltas.p95Latency < 0 ? "" : "+"}
                                {comparison.deltas.p95Latency}%
                              </div>
                            </div>

                            {/* Failure Rate */}
                            <div className="bg-slate-700/50 p-4 rounded border border-slate-600 hover:border-slate-500 transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">
                                  Failure Rate
                                </span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    comparison.trends.failureRate ===
                                    "improvement"
                                      ? "bg-emerald-900/50 text-emerald-300"
                                      : comparison.trends.failureRate ===
                                          "degraded"
                                        ? "bg-red-900/50 text-red-300"
                                        : "bg-slate-600/50 text-slate-300"
                                  }`}
                                >
                                  {comparison.trends.failureRate ===
                                  "improvement"
                                    ? "📈 Better"
                                    : comparison.trends.failureRate ===
                                        "degraded"
                                      ? "📉 Worse"
                                      : "➡️ Same"}
                                </span>
                              </div>
                              <div
                                className={`text-2xl font-bold ${
                                  comparison.deltas.failureRate < 0
                                    ? "text-emerald-400"
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
                            <div className="bg-slate-700/30 p-4 rounded border border-slate-600">
                              <h4 className="text-sm font-bold text-amber-300 mb-3">
                                💡 Key Insights
                              </h4>
                              <ul className="space-y-2">
                                {comparison.insights.map((insight, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start text-sm text-slate-200"
                                  >
                                    <span className="mr-2 text-amber-400 flex-shrink-0">
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
                </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
