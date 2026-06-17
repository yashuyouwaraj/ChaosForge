"use client";

import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/runtime";
import { useState } from "react";

export function ExportActions({ run, showOpenReport = true }) {
  const router = useRouter();
  const runId = run?.runId;
  const projectId = run?.projectId;
  const [isExporting, setIsExporting] = useState(false);

  const openReport = () => {
    if (!runId) {
      return;
    }

    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";

    router.push(`/reports/${runId}${query}`);
  };

  const downloadFile = async (format) => {
    if (!projectId || !runId) {
      alert("Project ID and Run ID are required to export");
      return;
    }

    setIsExporting(true);
    try {
      const baseUrl = getApiBaseUrl();
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const url = `${baseUrl}/report/${format}/${projectId}/${runId}`;

      const headers = {
        Authorization: token ? `Bearer ${token}` : "",
      };

      const response = await fetch(url, {
        method: format === "pdf" ? "POST" : "GET",
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Failed to download ${format.toUpperCase()}`
        );
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `report-${projectId}.${format === "json" ? "json" : format === "csv" ? "csv" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(`Export error:`, error);
      alert(`Failed to export ${format.toUpperCase()}: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="
        flex flex-wrap
        gap-3
      "
    >
      <button
        onClick={() => downloadFile("json")}
        disabled={!projectId || !runId || isExporting}
        className="
          rounded-2xl
          border border-white/10
          bg-black/20
          px-5 py-3
          text-sm font-semibold
          transition
          hover:bg-white/5
          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:hover:bg-black/20
        "
      >
        {isExporting ? "Exporting..." : "Export JSON"}
      </button>

      <button
        onClick={() => downloadFile("csv")}
        disabled={!projectId || !runId || isExporting}
        className="
          rounded-2xl
          border border-white/10
          bg-black/20
          px-5 py-3
          text-sm font-semibold
          transition
          hover:bg-white/5
          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:hover:bg-black/20
        "
      >
        {isExporting ? "Exporting..." : "Export CSV"}
      </button>

      <button
        onClick={() => downloadFile("pdf")}
        disabled={!projectId || !runId || isExporting}
        className="
          rounded-2xl
          border border-white/10
          bg-black/20
          px-5 py-3
          text-sm font-semibold
          transition
          hover:bg-white/5
          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:hover:bg-black/20
        "
      >
        {isExporting ? "Exporting..." : "Export PDF"}
      </button>

      {showOpenReport && (
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
      )}
    </div>
  );
}
