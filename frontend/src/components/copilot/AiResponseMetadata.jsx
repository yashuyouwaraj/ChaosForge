"use client";

import {
  Brain,
  Clock,
  Database,
  Sparkles,
  Zap,
} from "lucide-react";

const MODE_LABELS = {
  automatic: "Automatic",
  fast: "Fast",
  balanced: "Balanced",
  deep: "Deep Reasoning",
  custom: "Custom",
};

export function AiResponseMetadata({ metadata, streaming = false }) {
  if (!metadata) {
    return null;
  }

  const {
    providerDisplayName,
    provider,
    model,
    mode,
    confidence,
    responseTimeMs,
    ttftMs,
    cached,
    reasoningModel,
    streaming: metaStreaming,
  } = metadata;

  const isStreaming = streaming || metaStreaming;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
      {(providerDisplayName || provider) && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold text-slate-300">
          <Brain className="h-3 w-3" />
          {providerDisplayName || provider}
        </span>
      )}

      {model && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs font-semibold text-cyan-300">
          <Sparkles className="h-3 w-3" />
          {model}
        </span>
      )}

      {mode && (
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold text-slate-400">
          {MODE_LABELS[mode] || mode}
        </span>
      )}

      {reasoningModel && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-semibold text-purple-300">
          <Zap className="h-3 w-3" />
          Reasoning
        </span>
      )}

      {confidence != null && (
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold text-slate-400">
          {confidence}% confidence
        </span>
      )}

      {responseTimeMs != null && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold text-slate-400">
          <Clock className="h-3 w-3" />
          {responseTimeMs}ms
          {ttftMs != null && ttftMs !== responseTimeMs ? ` · TTFT ${ttftMs}ms` : ""}
        </span>
      )}

      {cached && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1 text-xs font-semibold text-green-300">
          <Database className="h-3 w-3" />
          Cached
        </span>
      )}

      {isStreaming && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs font-semibold text-cyan-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          Streaming
        </span>
      )}
    </div>
  );
}
