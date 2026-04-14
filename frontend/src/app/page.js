"use client";

import { useEffect, useState } from "react";
import socket from "../lib/socket";

export default function Home() {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    success: 0,
    failure: 0,
    totalLatency: 0,
    avgLatency: 0,
  });

  useEffect(() => {
    const handleMetrics = (data) => {
      setMetrics(data);
    };

    socket.on("metrics", handleMetrics);

    return () => {
      socket.off("metrics", handleMetrics);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">🔥 ChaosForge Dashboard</h1>

      <div className="grid grid-cols-5 gap-6">
        <div className="bg-gray-900 p-5 rounded-xl">
          <h2>Total Requests</h2>
          <p className="text-2xl">{metrics.totalRequests}</p>
        </div>

        <div className="bg-green-900 p-5 rounded-xl">
          <h2>Success</h2>
          <p className="text-2xl">{metrics.success}</p>
        </div>

        <div className="bg-red-900 p-5 rounded-xl">
          <h2>Failure</h2>
          <p className="text-2xl">{metrics.failure}</p>
        </div>

        <div className="bg-yellow-900 p-5 rounded-xl">
          <h2>Total Latency</h2>
          <p className="text-2xl">{metrics.totalLatency} ms</p>
        </div>

        <div className="bg-blue-900 p-5 rounded-xl">
          <h2>Avg Latency</h2>
          <p className="text-2xl">{metrics.avgLatency} ms</p>
        </div>
      </div>
    </div>
  );
}
