"use client";

import { motion } from "framer-motion";

import { GitBranch, ArrowDown } from "lucide-react";

import { useIncidentCorrelation } from "@/hooks/useIncidentCorrelation";

export function IncidentCorrelationGraph({ projectId, runId }) {
  const chains = useIncidentCorrelation(projectId, runId);

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
      {/* HEADER */}

      <div
        className="
          flex items-start
          justify-between
          gap-6
        "
      >
        <div>
          <h3
            className="
              text-3xl font-black
            "
          >
            Incident Correlation Graph
          </h3>

          <p
            className="
              mt-3 max-w-3xl
              text-muted-foreground
            "
          >
            AI-generated causal relationships between infrastructure events,
            anomalies, and operational degradation patterns.
          </p>
        </div>

        <div
          className="
            rounded-full
            border border-cyan-500/20
            bg-cyan-500/10
            px-5 py-3
            text-sm font-bold
            uppercase tracking-[0.2em]
            text-cyan-300
          "
        >
          {chains.length} Links
        </div>
      </div>

      {/* EMPTY */}

      {chains.length === 0 && (
        <div
          className="
            mt-10 rounded-[28px]
            border border-green-500/20
            bg-green-500/5
            p-10 text-center
          "
        >
          <GitBranch
            className="
              mx-auto h-12 w-12
              text-green-400
            "
          />

          <h3
            className="
              mt-5 text-3xl
              font-black
              text-green-300
            "
          >
            No Incident Chain Detected
          </h3>

          <p
            className="
              mt-4 text-slate-300
            "
          >
            No significant causal infrastructure relationships detected.
          </p>
        </div>
      )}

      {/* CHAINS */}

      <div
        className="
          mt-10 space-y-6
        "
      >
        {chains.map((chain, index) => (
          <motion.div
            key={`${chain.source}-${chain.target}`}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.05,
            }}
            className="
                rounded-[28px]
                border border-white/10
                bg-black/20
                p-8
              "
          >
            <div
              className="
                  flex flex-col
                  items-center
                  gap-4
                "
            >
              <div
                className="
                    rounded-2xl
                    border border-red-500/20
                    bg-red-500/5
                    px-6 py-4
                    text-center
                    font-bold
                  "
              >
                {chain.source}
              </div>

              <ArrowDown
                className="
                    h-6 w-6
                    text-cyan-400
                  "
              />

              <div
                className="
                    rounded-2xl
                    border border-cyan-500/20
                    bg-cyan-500/5
                    px-6 py-4
                    text-center
                    font-bold
                  "
              >
                {chain.target}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
