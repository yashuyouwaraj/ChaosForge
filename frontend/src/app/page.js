"use client";

import { useEffect, useState } from "react";
import socket from "../lib/socket";
import MetricsGrid from "../components/MetricsGrid";
import GraphSection from "../components/GraphSection";
import LogsPanel from "../components/LogsPanel";
import { api } from "../lib/api";
import PremiumGate from "../components/PremiumGate";
import PlanBadge from "../components/PlanBadge";
import PaymentHistory from "../components/PaymentHistory";

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
  const [plan, setPlan] = useState("free");
  const [logsByProject, setLogsByProject] = useState({});

  useEffect(() => {
    const id = localStorage.getItem("projectId");
    setProjectId(id);
  }, []);

  useEffect(() => {
    let shouldPoll = true;

    const fetchUser = async () => {
      try {
        const data = await api("/auth/me");

        if (shouldPoll) {
          setPlan(data.plan || "free");
        }
      } catch (error) {
        if (
          error.message === "User not found" ||
          error.message === "Invalid token" ||
          error.message === "No token provided"
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("projectId");
          setProjectId(null);
          setPlan("free");
          shouldPoll = false;
          return;
        }

        console.warn("Failed to fetch user:", error.message);
      }
    };

    fetchUser();

    const interval = setInterval(fetchUser, 3000);

    return () => {
      shouldPoll = false;
      clearInterval(interval);
    };
  }, []);

  const upgrade = async () => {
    try {
      const res = await api("/payment/checkout", "POST");
      window.location.href = res.url;
    } catch (err) {
      console.error(err);
    }
  };

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
        "POST",
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
    if (!projectId) {
      return;
    }

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

    const metricsEvent = `metrics-${projectId}`;
    socket.on(metricsEvent, handleMetrics);

    return () => {
      socket.off(metricsEvent, handleMetrics);
    };
  }, [projectId]);

  useEffect(() => {
    const handleProjectLog = (log) => {
      if (!log?.projectId) {
        return;
      }

      setLogsByProject((prev) => ({
        ...prev,
        [log.projectId]: [...(prev[log.projectId] || []).slice(-50), log],
      }));
    };

    socket.on("project-log", handleProjectLog);

    return () => {
      socket.off("project-log", handleProjectLog);
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
      <div className="mb-4">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl">ChaosForge</h1>
          <PlanBadge plan={plan} />
        </div>
      </div>

      <button
        onClick={upgrade}
        className="bg-purple-500 px-4 py-2 rounded-lg mb-4"
      >
        Upgrade to Pro
      </button>

      <PaymentHistory />

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

        <PremiumGate plan={plan} required="pro" onUpgrade={upgrade}>
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="bg-blue-500 px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {isRunning ? "Running..." : "Run High Traffic Simulation"}
          </button>
        </PremiumGate>

        <PremiumGate plan={plan} required="premium" onUpgrade={upgrade}>
          <div className="bg-purple-900 p-6 rounded-xl mt-6">
            Chaos Engine (Advanced Failure Simulation)
          </div>
        </PremiumGate>

        {status ? <p className="mt-3 text-sm text-gray-300">{status}</p> : null}
      </div>

      <MetricsGrid metrics={metrics} />
      <GraphSection data={graphData} />
      <LogsPanel projectId={projectId} logs={logsByProject[projectId] || []} />
    </div>
  );
}
