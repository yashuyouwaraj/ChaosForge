"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Square } from "lucide-react";

import { useAiCopilot } from "@/hooks/useAiCopilot";
import { AiResponseCards } from "@/components/copilot/AiResponseCards";
import { AiResponseMetadata } from "@/components/copilot/AiResponseMetadata";

const APPENDIX_TIMEOUT_MS = 120_000;

export function AiReportAppendix({ projectId, runId }) {
  const { response, loading, error, invoke, stop, reset } = useAiCopilot();
  const [attempt, setAttempt] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const requestKeyRef = useRef("");
  const timeoutRef = useRef(null);

  const clearRequestTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const generateAppendix = useCallback(
    async (force = false) => {
      if (!projectId || !runId) {
        return;
      }

      const key = `${projectId}:${runId}`;
      requestKeyRef.current = key;
      setTimedOut(false);
      clearRequestTimeout();

      timeoutRef.current = setTimeout(() => {
        stop();
        setTimedOut(true);
      }, APPENDIX_TIMEOUT_MS);

      try {
        await invoke("aiReportGenerator", { projectId, runId }, { force });
      } catch {
        // error state handled by hook
      } finally {
        clearRequestTimeout();
      }
    },
    [projectId, runId, invoke, stop, clearRequestTimeout],
  );

  useEffect(() => {
    reset();
    setAttempt(0);
    setTimedOut(false);
    requestKeyRef.current = "";
  }, [projectId, runId, reset]);

  useEffect(() => {
    if (!projectId || !runId) {
      return undefined;
    }

    generateAppendix(false);
    return () => {
      clearRequestTimeout();
      stop();
    };
  }, [projectId, runId, attempt, generateAppendix, clearRequestTimeout, stop]);

  const handleRetry = () => {
    reset();
    setTimedOut(false);
    setAttempt((previous) => previous + 1);
  };

  const handleCancel = () => {
    stop();
    clearRequestTimeout();
    setTimedOut(false);
  };

  if (loading && !response) {
    return (
      <div className="glass rounded-[32px] p-8">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          <span>Generating AI report appendix...</span>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          This may take up to two minutes for deep analysis. You can cancel and retry if
          needed.
        </p>
        <button
          type="button"
          onClick={handleCancel}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300"
        >
          <Square className="h-4 w-4" />
          Cancel
        </button>
      </div>
    );
  }

  if (error || timedOut) {
    return (
      <div className="glass rounded-[32px] p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-red-300">AI Report Appendix</p>
        <h2 className="mt-3 text-2xl font-black text-white">Generation unavailable</h2>
        <p className="mt-3 text-slate-400">
          {timedOut
            ? "The AI request timed out. The operational report above is still complete."
            : error || "Unable to generate the AI appendix."}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  const metadata = response.metadata || {};

  return (
    <div className="glass rounded-[32px] p-8">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
        AI Report Appendix
      </p>
      <h2 className="mt-3 text-3xl font-black">AI-Generated Report Insights</h2>
      <p className="mt-3 text-muted-foreground">
        Appended AI analysis — executive summary, findings, recommendations,
        operational insights, and generation metadata.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="AI Confidence" value={`${response.confidence ?? "—"}%`} />
        <Metric label="AI Model" value={metadata.model || "—"} />
        <Metric
          label="Generation Time"
          value={
            metadata.responseTimeMs != null
              ? `${metadata.responseTimeMs}ms`
              : "—"
          }
        />
        <Metric
          label="Provider"
          value={metadata.providerDisplayName || metadata.provider || "NVIDIA"}
        />
      </div>

      <div className="mt-8">
        <AiResponseMetadata metadata={metadata} />
        <AiResponseCards response={response} />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-200">{value}</p>
    </div>
  );
}
