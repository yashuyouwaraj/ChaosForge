"use client";

import { useEffect, useState } from "react";
import socket from "../lib/socket";
import MetricsGrid from "../components/MetricsGrid";
import GraphSection from "../components/GraphSection";

export default function Home() {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    success: 0,
    failure: 0,
    avgLatency: 0,
  });

  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    socket.on("metrics", (data)=>{
      setMetrics(data);

      setGraphData((prev)=>[
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          requests: data.totalRequests
        }
      ])
    });


    return () => {
      socket.off("metrics");
    };
  }, []);

   return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">🔥 ChaosForge Dashboard</h1>

      <MetricsGrid metrics={metrics} />

      <GraphSection data={graphData} />
    </div>
  );
}
