"use client";

import { useEffect, useState } from "react";
import socket from "../lib/socket";
import MetricsGrid from "../components/MetricsGrid";
import GraphSection from "../components/GraphSection";
import LogsPanel from "../components/LogsPanel";
import { api } from "../lib/api";

export default function Home() {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    success: 0,
    failure: 0,
    avgLatency: 0,
  });
  const [projectId, setProjectId] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [status, setStatus] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [count, setCount] = useState("50");

  const upgrade = async () => {
    try {
      const res = await api("/auth/upgrade", "POST", { plan: "pro" });

      if (res?.token) {
        localStorage.setItem("token", res.token);
      }

      setStatus(res?.message || "Upgraded to Pro");
    } catch (error) {
      setStatus(error.message || "Upgrade failed");
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("projectId");
    setProjectId(id);
  }, []);

  const runSimulation = async () => {
    if (!projectId) {
      setStatus("No project selected");
      return;
    }

    const parsedCount = Number.parseInt(count, 10);

    if (!Number.isInteger(parsedCount) || parsedCount <= 0) {
      setStatus("Enter a valid request count greater than 0");
      return;
    }

    try {
      setIsRunning(true);
      setStatus("");
      const res = await api(
        `/projects/${projectId}/traffic?count=${parsedCount}`,
        "POST"
      );
      setStatus(res?.message || "Simulation started");
    } catch (error) {
      if (error.message === "Project not found") {
        localStorage.removeItem("projectId");
        setProjectId(null);
      }

      setStatus(error.message || "Failed to run simulation");
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    const handleMetrics = (data) => {
      setMetrics(data);
      setGraphData((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          requests: data.totalRequests,
        },
      ]);
    };

    socket.on("metrics", handleMetrics);

    return () => {
      socket.off("metrics", handleMetrics);
    };
  }, []);

  if (!projectId) {
    return (
      <div className="p-10">
        No project selected. Open Projects and choose one again.
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ChaosForge Dashboard</h1>

      <button
        onClick={upgrade}
        className="bg-purple-500 px-4 py-2 rounded-lg mb-4"
      >
        Upgrade to Pro
      </button>

      <div className="mb-6">
        <div className="mb-3">
          <input
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-40 rounded-lg border border-white/20 bg-white/5 px-3 py-2"
            placeholder="Request count"
          />
        </div>
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg disabled:opacity-60"
        >
          {isRunning ? "Running..." : "Run Simulation"}
        </button>
        {status ? <p className="mt-3 text-sm text-gray-300">{status}</p> : null}
      </div>

      <MetricsGrid metrics={metrics} />
      <GraphSection data={graphData} />
      <LogsPanel />
    </div>
  );
}
