"use client";

import { motion } from "framer-motion";

import { AiResponseMetadata } from "./AiResponseMetadata";

const severityStyles = {
  info: "border-cyan-500/20 bg-cyan-500/5 text-cyan-300",
  moderate: "border-yellow-500/20 bg-yellow-500/5 text-yellow-300",
  warning: "border-orange-500/20 bg-orange-500/5 text-orange-300",
  high: "border-orange-500/20 bg-orange-500/5 text-orange-300",
  critical: "border-red-500/20 bg-red-500/5 text-red-300",
};

export function AiResponseCards({ response, streaming = false, streamText = "" }) {
  if (!response && !streamText) {
    return null;
  }

  const cards = Array.isArray(response?.cards) ? response.cards : [];
  const displaySummary = streamText || response?.summary;

  return (
    <div className="space-y-6">
      {displaySummary && (
        <div className="rounded-[28px] border border-cyan-500/20 bg-cyan-500/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            Executive Summary
          </p>
          <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-slate-200">
            {displaySummary}
            {streaming && (
              <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-cyan-400" />
            )}
          </p>
        </div>
      )}

      {response?.metadata && (
        <AiResponseMetadata metadata={response.metadata} streaming={streaming} />
      )}

      {cards.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {cards.map((card, index) => (
            <motion.div
              key={`${card.title}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-[24px] border p-6 ${
                severityStyles[card.severity] || severityStyles.info
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h4 className="text-lg font-black">{card.title}</h4>
                {card.confidence != null && (
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold">
                    {card.confidence}%
                  </span>
                )}
              </div>
              {card.content && (
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {card.content}
                </p>
              )}
              {Array.isArray(card.items) && card.items.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {card.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="text-sm leading-6 text-muted-foreground"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {Array.isArray(response?.findings) && response.findings.length > 0 && (
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
          <h4 className="text-lg font-black">Findings</h4>
          <div className="mt-4 space-y-3">
            {response.findings.map((finding, index) => (
              <p key={index} className="text-sm leading-7 text-slate-300">
                {finding}
              </p>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(response?.recommendations) &&
        response.recommendations.length > 0 && (
          <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
            <h4 className="text-lg font-black">Recommendations</h4>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {response.recommendations.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-200">
                      {item.recommendation || item.title}
                    </p>
                    <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      {item.priority || "Medium"}
                    </span>
                  </div>
                  {item.expectedImpact && (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {item.expectedImpact}
                    </p>
                  )}
                  {item.category && (
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {item.category}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
