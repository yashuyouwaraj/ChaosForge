"use client";

import { useEffect, useState, useRef } from "react";
import socket from "../lib/socket";

export default function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleLog = (log) => {
      setLogs((prev) => [...prev.slice(-50), log]); // keep last 50 logs
    };

    socket.on("logs", handleLog);

    return () => socket.off("logs", handleLog);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 mt-6 h-64 overflow-y-auto font-mono text-sm">
      <h2 className="mb-2 text-gray-400">🧾 Live Logs</h2>

      {logs.map((log, index) => (
        <div key={index} className="mb-1">
          <span className="text-gray-500">[{log?.time || "--:--:--"}]</span>{" "}
          <span className="text-purple-400">
            [{(log?.requestId || "local").slice(0, 5)}]
          </span>{" "}
          <span
            className={
              log?.type === "error"
                ? "text-red-400"
                : log?.type === "success"
                ? "text-green-400"
                : "text-gray-300"
            }
          >
            {log?.message || "No log message"}
          </span>
        </div>
      ))}

      <div ref={bottomRef}></div>
    </div>
  );
}
