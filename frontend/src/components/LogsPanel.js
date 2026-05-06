"use client";

import { useEffect, useRef } from "react";

const getColor = (type) => {
  switch (type) {
    case "success":
      return "text-green-500";

    case "retry":
      return "text-yellow-500";

    case "error":
      return "text-red-500";

    default:
      return "text-gray-300";
  }
};

export default function LogsPanel({ projectId, logs = [], focusTrigger = 0 }) {
  const panelRef = useRef(null);

  const scrollToLogEnd = () => {
    if (!panelRef.current) {
      return;
    }

    panelRef.current.scrollTop = panelRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToLogEnd();
  }, [logs]);

  useEffect(() => {
    if (focusTrigger === 0 || !panelRef.current) {
      return;
    }

    panelRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    scrollToLogEnd();
  }, [focusTrigger]);

  return (
    <div
      ref={panelRef}
      className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 mt-6 h-64 overflow-y-auto font-mono text-sm"
    >
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
          <span className={getColor(log?.type)}>
            {log?.message || "No log message"}
          </span>
        </div>
      ))}
    </div>
  );
}
