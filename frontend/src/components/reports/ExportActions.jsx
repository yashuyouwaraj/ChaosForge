"use client";

import { useRouter } from "next/navigation";

export function ExportActions({ run }) {
  const router = useRouter();
  const runId = run?.runId;
  const projectId = run?.projectId;

  const openReport = () => {
    if (!runId) {
      return;
    }

    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";

    router.push(`/reports/${runId}${query}`);
  };

  return (
    <div
      className="
        flex flex-wrap
        gap-3
      "
    >
      <button
        className="
          rounded-2xl
          border border-white/10
          bg-black/20
          px-5 py-3
          text-sm font-semibold
          transition
          hover:bg-white/5
        "
      >
        Export JSON
      </button>

      <button
        className="
          rounded-2xl
          border border-white/10
          bg-black/20
          px-5 py-3
          text-sm font-semibold
          transition
          hover:bg-white/5
        "
      >
        Export CSV
      </button>

      <button
        disabled={!runId}
        onClick={openReport}
        className="
          rounded-2xl
          bg-cyan-500
          px-5 py-3
          text-sm font-bold
          text-black
          transition
          hover:scale-[1.02]
          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:hover:scale-100
        "
      >
        Open Report
      </button>
    </div>
  );
}
