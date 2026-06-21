"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Loader2, RotateCcw, Sparkles, Square, X } from "lucide-react";

import { useAiCopilot } from "@/hooks/useAiCopilot";
import { AiResponseCards } from "./AiResponseCards";

export function AiExplainPanel({
  open,
  onClose,
  title = "AI Analysis",
  skill,
  payload,
  stream = true,
}) {
  const { response, loading, streaming, streamText, error, invoke, stop } =
    useAiCopilot();
  const payloadKey = useMemo(() => JSON.stringify(payload || {}), [payload]);
  const lastKeyRef = useRef("");

  useEffect(() => {
    if (!open || !skill) {
      return;
    }

    if (lastKeyRef.current === payloadKey) {
      return;
    }

    lastKeyRef.current = payloadKey;
    invoke(skill, payload, { stream }).catch(() => {});
  }, [open, skill, payload, payloadKey, invoke, stream]);

  useEffect(() => {
    if (!open) {
      lastKeyRef.current = "";
    }
  }, [open]);

  const handleCopy = async () => {
    const text = response?.summary || streamText;

    if (text) {
      await navigator.clipboard.writeText(text);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/10 p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
              ChaosForge AI Copilot
            </p>
            <h2 className="mt-3 text-3xl font-black">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {(loading || streaming) && (
              <button
                type="button"
                onClick={stop}
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-300 transition hover:bg-red-500/20"
              >
                <Square className="h-5 w-5" />
              </button>
            )}
            {response && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-300 transition hover:bg-white/10"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    invoke(skill, payload, { force: true, stream }).catch(
                      () => {},
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-300 transition hover:bg-white/10"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-300 transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {(loading || streaming) && !streamText && (
          <div className="mt-10 flex items-center gap-3 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            {streaming ? "Streaming analysis..." : "Analyzing operational intelligence..."}
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-200">
            {error}
          </div>
        )}

        {(response || streamText) && (
          <div className="mt-8">
            <AiResponseCards
              response={response}
              streaming={streaming}
              streamText={streamText}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function AiExplainButton({
  label = "Explain",
  title,
  skill,
  payload,
  className = "",
  stream = true,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 ${className}`}
      >
        <Sparkles className="h-4 w-4" />
        {label}
      </button>

      <AiExplainPanel
        open={open}
        onClose={() => setOpen(false)}
        title={title || label}
        skill={skill}
        payload={payload}
        stream={stream}
      />
    </>
  );
}
