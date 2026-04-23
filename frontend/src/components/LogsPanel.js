"use client";

import { useEffect, useRef } from "react";

export default function LogsPanel({ projectId, logs = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 mt-6 h-64 overflow-y-auto font-mono text-sm">
      <h2 className="mb-2 text-gray-400">
        Live Logs {projectId ? `(${projectId.slice(0, 8)})` : ""}
      </h2>

      {logs.length === 0 ? (
        <p className="text-gray-500">No logs yet. Run a simulation.</p>
      ) : null}

      {logs.map((log, index) => (
        <div key={`${log?.requestId || "log"}-${index}`} className="mb-1">
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
