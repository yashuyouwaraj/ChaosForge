"use client";

import { useEffect, useRef, useState } from "react";
import socket from "../lib/socket";
import MetricsGrid from "../components/MetricsGrid";
import GraphSection from "../components/GraphSection";
import LogsPanel from "../components/LogsPanel";
import { api, getBaseUrl } from "../lib/api";
import PremiumGate from "../components/PremiumGate";
import PlanBadge from "../components/PlanBadge";
import PaymentHistory from "../components/PaymentHistory";
import MetricsChart from "../components/MetricsChart";
import DistributionChart from "@/components/DistributionChart";
import ErrorPieChart from "@/components/ErrorPieChart";
import RpsChart from "@/components/RpsChart";

const MAX_CHART_POINTS = 240;

export default function Home() {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    success: 0,
    failure: 0,
    avgLatency: 0,
    p95Latency: 0,
    rps: 0,
    latencyBuckets: {
      "0-500": 0,
      "500-1000": 0,
      "1000-2000": 0,
      "2000+": 0,
    },
    errorTypes: {
      timeout: 0,
      network: 0,
      server: 0,
    },
  });


  const [projectId, setProjectId] = useState(null);
  const [runId, setRunId] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [status, setStatus] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [simulationState, setSimulationState] = useState("idle"); // idle, running, paused, stopped
  const [count, setCount] = useState("50");
  const [url, setUrl] = useState("");
  const [plan, setPlan] = useState("free");
  const [logs, setLogs] = useState([]);
  const [rate, setRate] = useState("5");
  const [controlRate, setControlRate] = useState("5");
  const [isApplyingRate, setIsApplyingRate] = useState(false);
  const [logsFocusTrigger, setLogsFocusTrigger] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [history, setHistory] = useState([]);
  const pendingLogsRef = useRef([]);
  const flushScheduledRef = useRef(false);
  const latestMetricsRef = useRef(null);
  const chartStartTimeRef = useRef(null);
  const requestsChartRef = useRef(null);
  const latencyChartRef = useRef(null);
  const rpsChartRef = useRef(null);
  const distributionChartRef = useRef(null);
  const errorChartRef = useRef(null);
  const stoppedRunIdRef = useRef(null);

  

  useEffect(() => {
    const id = localStorage.getItem("projectId");
    const activeRunId = localStorage.getItem("currentRunId");
    const hasActiveRun = localStorage.getItem("currentRunActive") === "true";

    setProjectId(id);
    if (activeRunId && hasActiveRun) {
      setRunId(activeRunId);
      setSimulationState("running");
      setIsRunning(true);
      setStatus("Simulation running");
      const startTimestamp = Date.now();
      chartStartTimeRef.current = startTimestamp;
      const startTime = new Date(startTimestamp).toLocaleTimeString();
      setGraphData([
        { time: startTime, timestamp: startTimestamp, elapsedSec: 0, requests: 0 },
      ]);
      setHistory([
        {
          time: startTime,
          timestamp: startTimestamp,
          elapsedSec: 0,
          avgLatency: 0,
          p95Latency: 0,
          rps: 0,
        },
      ]);
      return;
    }

    setRunId(null);
    setSimulationState("idle");
    setIsRunning(false);
    localStorage.removeItem("currentRunId");
    localStorage.removeItem("currentRunActive");
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
          localStorage.removeItem("currentRunId");
          setProjectId(null);
          setRunId(null);
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

  const addMetricsSnapshot = (snapshot) => {
    const timestamp = Date.now();
    if (!chartStartTimeRef.current) {
      chartStartTimeRef.current = timestamp;
    }
    const elapsedSec = Math.round((timestamp - chartStartTimeRef.current) / 1000);
    const time = new Date(timestamp).toLocaleTimeString();
    setMetrics(snapshot);
    setHistory((prev) =>
      [
        ...prev,
        {
          time,
          timestamp,
          elapsedSec,
          avgLatency: snapshot.avgLatency,
          p95Latency: snapshot.p95Latency ?? 0,
          rps: snapshot.currentRps ?? snapshot.rps,
        },
      ].slice(-MAX_CHART_POINTS),
    );
    setGraphData((prev) =>
      [
        ...prev,
        {
          time,
          timestamp,
          elapsedSec,
          requests: snapshot.totalRequests,
        },
      ].slice(-MAX_CHART_POINTS),
    );
  };

  const refreshMetricsSnapshot = async (targetRunId = runId) => {
    if (!projectId) {
      return;
    }

    const snapshot = await api(
      `/metrics/${projectId}${targetRunId ? `?runId=${targetRunId}` : ""}`,
    );
    addMetricsSnapshot(snapshot);
  };

  const imageToDataUrl = (image, timeoutMs = 4000) =>
    new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error("Chart capture timed out"));
      }, timeoutMs);

      image.onload = () => {
        window.clearTimeout(timeout);
        resolve();
      };

      image.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("Chart capture failed"));
      };
    });

  const captureChart = async (ref) => {
    if (!ref.current) {
      return null;
    }

    const svg = ref.current.querySelector("svg");
    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const clonedSvg = svg.cloneNode(true);
    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const inlineStyles = (source, target) => {
      const sourceElements = source.querySelectorAll("*");
      const targetElements = target.querySelectorAll("*");

      if (sourceElements.length !== targetElements.length) {
        return;
      }

      sourceElements.forEach((sourceEl, index) => {
        const targetEl = targetElements[index];
        const computed = window.getComputedStyle(sourceEl);
        const styleText = Array.from(computed).reduce((text, property) => {
          return `${text}${property}:${computed.getPropertyValue(property)};`;
        }, "");
        targetEl.setAttribute("style", styleText);
      });
    };

    inlineStyles(svg, clonedSvg);

    const background = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    background.setAttribute("width", "100%");
    background.setAttribute("height", "100%");
    background.setAttribute("fill", "#0f172a");
    clonedSvg.insertBefore(background, clonedSvg.firstChild);

    const svgText = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgText], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    try {
      const imageLoaded = imageToDataUrl(image);
      image.src = svgUrl;
      await imageLoaded;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.fillStyle = "#0f172a";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        throw new Error("Chart image failed to render");
      }

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.warn(error.message);
      return null;
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  };

  const downloadPdf = async () => {
    if (!projectId || isDownloadingPdf) {
      return;
    }

    try {
      setIsDownloadingPdf(true);
      await refreshMetricsSnapshot();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const charts = await Promise.all([
        captureChart(requestsChartRef),
        captureChart(latencyChartRef),
        captureChart(rpsChartRef),
        captureChart(distributionChartRef),
        captureChart(errorChartRef),
      ]);
      const token = localStorage.getItem("token");
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      let res;
      try {
        res = await fetch(`${getBaseUrl()}/report/pdf/${projectId}`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            requestsChart: charts[0],
            latencyChart: charts[1],
            rpsChart: charts[2],
            distributionChart: charts[3],
            errorChart: charts[4],
          }),
        });
      } finally {
        window.clearTimeout(timeout);
      }

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to download PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${projectId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setStatus(error.message || "Failed to download PDF");
    } finally {
      setIsDownloadingPdf(false);
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
      setRunId(null);
      stoppedRunIdRef.current = null;
      setSimulationState("running");
      setStatus("Starting simulation...");
      setControlRate(rate);
      const startTimestamp = Date.now();
      chartStartTimeRef.current = startTimestamp;
      const startTime = new Date(startTimestamp).toLocaleTimeString();
      setGraphData([{ time: startTime, timestamp: startTimestamp, elapsedSec: 0, requests: 0 }]);
      setHistory([
        {
          time: startTime,
          timestamp: startTimestamp,
          elapsedSec: 0,
          avgLatency: 0,
          p95Latency: 0,
          rps: 0,
        },
      ]);
      const res = await api(
        `/projects/${projectId}/traffic?count=${parsedCount}&url=${encodeURIComponent(url)}&rate=${rate}`,
        "POST",
      );
      if (res?.runId) {
        localStorage.setItem("currentRunId", res.runId);
        localStorage.setItem("currentRunActive", "true");
        setRunId(res.runId);
      }
      await refreshMetricsSnapshot(res?.runId || runId);
      setStatus(res?.message || "Simulation started");
      setLogsFocusTrigger((current) => current + 1);
    } catch (error) {
      if (error.message === "Project not found") {
        localStorage.removeItem("projectId");
        localStorage.removeItem("currentRunId");
        localStorage.removeItem("currentRunActive");
        setProjectId(null);
        setRunId(null);
      }

      setStatus(error.message || "Failed to run simulation");
      setSimulationState("idle");
      setIsRunning(false);
    }
  };

  const pauseSimulation = () => {
    if (!runId) return;

    socket.emit("pause", { projectId, runId });
    setSimulationState("paused");
    setStatus("Simulation paused");
  };

  const resumeSimulation = () => {
    if (!runId) return;

    socket.emit("resume", { projectId, runId });
    setSimulationState("running");
    setStatus("Simulation resumed");
  };

  const stopSimulation = () => {
    if (!runId) return;

    socket.emit("stop", { projectId, runId });
    stoppedRunIdRef.current = runId;
    setSimulationState("stopped");
    setIsRunning(false);
    setStatus("Simulation stopped");
    setRunId(null);
    localStorage.removeItem("currentRunId");
    localStorage.removeItem("currentRunActive");
  };

  const changeSimulationRate = (value) => {
    setControlRate(value);
  };

  const applySimulationRate = () => {
    const nextRate = Number(controlRate);
    if (!runId || !Number.isFinite(nextRate) || nextRate <= 0) {
      setStatus("Enter a valid RPS greater than 0");
      return;
    }

    setIsApplyingRate(true);
    socket.timeout(3000).emit(
      "set-rate",
      {
        projectId,
        runId,
        rate: nextRate,
      },
      (error, response) => {
        setIsApplyingRate(false);

        if (error) {
          setStatus("RPS change timed out. Check the backend/socket connection.");
          return;
        }

        if (!response?.ok) {
          setStatus(response?.message || "Failed to change RPS");
          return;
        }

        setStatus(`RPS changed to ${response.rate}. It applies on the next batch.`);
      },
    );
  };

  useEffect(() => {
    const handleControlError = (error) => {
      setStatus(error?.message || "Simulation control failed");
    };

    socket.on("control-error", handleControlError);

    return () => {
      socket.off("control-error", handleControlError);
    };
  }, []);

  useEffect(() => {
    if (!projectId || !runId) {
      return;
    }

    const handleComplete = () => {
      if (stoppedRunIdRef.current === runId) {
        stoppedRunIdRef.current = null;
        return;
      }

      setSimulationState("idle");
      setIsRunning(false);
      setRunId(null);
      setStatus("Simulation completed");
      localStorage.removeItem("currentRunId");
      localStorage.removeItem("currentRunActive");
    };

    const completeEvent = `complete-${projectId}-${runId}`;
    socket.on(completeEvent, handleComplete);

    return () => {
      socket.off(completeEvent, handleComplete);
    };
  }, [projectId, runId]);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const handleMetrics = (data) => {
      latestMetricsRef.current = data;
    };

    const metricsEvent = `metrics-${projectId}`;
    socket.on(metricsEvent, handleMetrics);

    const interval = setInterval(() => {
      if (!latestMetricsRef.current) {
        return;
      }

      const snapshot = latestMetricsRef.current;
      const timestamp = Date.now();
      if (!chartStartTimeRef.current) {
        chartStartTimeRef.current = timestamp;
      }
      const elapsedSec = Math.round((timestamp - chartStartTimeRef.current) / 1000);
      const time = new Date(timestamp).toLocaleTimeString();

      setMetrics(snapshot);
      setHistory((prev) =>
        [
          ...prev,
          {
            time,
            timestamp,
            elapsedSec,
            avgLatency: snapshot.avgLatency,
            p95Latency: snapshot.p95Latency ?? 0,
            rps: snapshot.currentRps ?? snapshot.rps,
          },
        ].slice(-MAX_CHART_POINTS),
      );
      setGraphData((prev) =>
        [
          ...prev,
          {
            time,
            timestamp,
            elapsedSec,
            requests: snapshot.totalRequests,
          },
        ].slice(-MAX_CHART_POINTS),
      );
      latestMetricsRef.current = null;
    }, 500);

    return () => {
      clearInterval(interval);
      socket.off(metricsEvent, handleMetrics);
    };
  }, [projectId]);

  useEffect(() => {
    pendingLogsRef.current = [];
    setLogs([]);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const flushLogs = () => {
      const incomingLogs = pendingLogsRef.current;
      if (incomingLogs.length === 0) {
        flushScheduledRef.current = false;
        return;
      }

      pendingLogsRef.current = [];
      setLogs((prev) => [...prev, ...incomingLogs].slice(-100));
      flushScheduledRef.current = false;
    };

    const scheduleFlush = () => {
      if (flushScheduledRef.current) {
        return;
      }
      flushScheduledRef.current = true;
      requestAnimationFrame(flushLogs);
    };

    const handleLogEvent = (incoming) => {
      const incomingLogs = Array.isArray(incoming) ? incoming : [incoming];
      pendingLogsRef.current.push(...incomingLogs);
      scheduleFlush();
    };

    const projectLogEvent = `logs-${projectId}`;
    socket.on(projectLogEvent, handleLogEvent);

    return () => {
      socket.off(projectLogEvent, handleLogEvent);
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="p-10">
        No project selected. Open Projects and choose one again.
      </div>
    );
  }

  const hasActiveSimulation = isRunning || Boolean(runId);

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
            placeholder="Enter API URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="p-2 mr-2"
          />
          <input
            placeholder="Requests per second"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="p-2 mr-2"
          />
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
            disabled={hasActiveSimulation}
            className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {hasActiveSimulation ? "Simulation Running" : "Run High Traffic Simulation"}
          </button>
        </PremiumGate>

        {hasActiveSimulation && (
          <div className="mb-4 p-4 bg-white/5 border border-white/20 rounded-lg">
            <div className="flex gap-3 flex-wrap items-center">
              <button
                onClick={pauseSimulation}
                disabled={!runId || simulationState !== "running"}
                className="bg-yellow-500 px-4 py-2 rounded-lg disabled:opacity-60 hover:bg-yellow-600 transition font-medium"
              >
                ⏸ Pause
              </button>

              <button
                onClick={resumeSimulation}
                disabled={!runId || simulationState !== "paused"}
                className="bg-green-500 px-4 py-2 rounded-lg disabled:opacity-60 hover:bg-green-600 transition font-medium"
              >
                ▶ Resume
              </button>

              <button
                onClick={stopSimulation}
                disabled={!runId || simulationState === "stopped"}
                className="bg-red-500 px-4 py-2 rounded-lg disabled:opacity-60 hover:bg-red-600 transition font-medium"
              >
                🛑 Stop
              </button>

              <input
                type="number"
                min="1"
                placeholder="Change RPS"
                value={controlRate}
                onChange={(e) => changeSimulationRate(e.target.value)}
                disabled={!runId || simulationState === "stopped"}
                className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 disabled:opacity-60"
              />

              <button
                onClick={applySimulationRate}
                disabled={!runId || simulationState === "stopped" || isApplyingRate}
                className="bg-cyan-500 px-4 py-2 rounded-lg disabled:opacity-60 hover:bg-cyan-600 transition font-medium"
              >
                {isApplyingRate ? "Applying..." : "Apply RPS"}
              </button>

              <span className="text-sm font-semibold px-3 py-2 rounded-lg bg-white/10">
                {!runId && simulationState === "running" && "Starting..."}
                {runId && simulationState === "running" && "🟢 Running"}
                {simulationState === "paused" && "⏸️ Paused"}
                {simulationState === "stopped" && "🛑 Stopped"}
              </span>
            </div>
          </div>
        )}

        <PremiumGate plan={plan} required="premium" onUpgrade={upgrade}>
          <div className="bg-purple-900 p-6 rounded-xl mt-6">
            Chaos Engine (Advanced Failure Simulation)
          </div>
        </PremiumGate>

        <div className="mt-3">
          <p className="text-sm text-gray-300">
            Status: {simulationState === "idle" ? "Ready" : simulationState.charAt(0).toUpperCase() + simulationState.slice(1)}
            {status && ` - ${status}`}
          </p>
        </div>
      </div>

      <MetricsGrid metrics={metrics} />
      <div className="grid min-w-0 grid-cols-1 xl:grid-cols-2 gap-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div ref={requestsChartRef} className="min-w-0">
          <GraphSection data={graphData} />
        </div>
        <div ref={latencyChartRef} className="min-w-0">
          <MetricsChart data={history} />
        </div>
        <div ref={rpsChartRef} className="min-w-0">
          <RpsChart data={history} />
        </div>
        <div ref={distributionChartRef} className="min-w-0">
          <DistributionChart buckets={metrics.latencyBuckets} />
        </div>
        <div ref={errorChartRef} className="min-w-0">
          <ErrorPieChart errorTypes={metrics.errorTypes} />
        </div>
      </div>
      <LogsPanel
        projectId={projectId}
        logs={logs}
        focusTrigger={logsFocusTrigger}
      />

      <div className="flex flex-col gap-2">
        <a
          href={projectId ? `${getBaseUrl()}/report/csv/${projectId}` : "#"}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-blue-500 px-4 py-2 rounded-lg text-center disabled:opacity-60"
          aria-disabled={!projectId}
        >
          Download CSV
        </a>

        <button
          type="button"
          onClick={downloadPdf}
          disabled={!projectId || isDownloadingPdf}
          className="inline-block bg-blue-500 px-4 py-2 rounded-lg text-center disabled:opacity-60 mt-2"
        >
          {isDownloadingPdf ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>
    </div>
  );
}
