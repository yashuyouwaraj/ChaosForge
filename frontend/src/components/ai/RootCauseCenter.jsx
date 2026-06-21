"use client";

import { motion } from "framer-motion";

import { BrainCircuit, AlertTriangle, Search } from "lucide-react";

import { useRootCauseAnalysis } from "@/hooks/useRootCauseAnalysis";
import { useIntelligence } from "@/hooks/useIntelligence";

export function RootCauseCenter({ projectId, runId }) {
  const { loading } = useIntelligence(projectId, runId);
  const causes = useRootCauseAnalysis(projectId, runId);

  if (loading) {
    return (
      <div
        className="
          glass rounded-[32px]
          p-8
        "
      >
        Loading root cause analysis...
      </div>
    );
  }

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
          flex flex-wrap
          items-start
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
            Root Cause Intelligence
          </h3>

          <p
            className="
              mt-3 max-w-3xl
              text-muted-foreground
            "
          >
            AI-generated root cause analysis derived from simulation metrics,
            anomaly detection, and operational intelligence scoring.
          </p>
        </div>

        <div
          className="
            rounded-full
            border border-cyan-500/20
            bg-cyan-500/10
            px-5 py-3
            text-sm font-bold
            uppercase
            tracking-[0.2em]
            text-cyan-300
          "
        >
          {causes.length} Causes
        </div>
      </div>

      {/* EMPTY */}

      {causes.length === 0 && (
        <div
          className="
            mt-10 rounded-[28px]
            border border-green-500/20
            bg-green-500/5
            p-10 text-center
          "
        >
          <BrainCircuit
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
            No Active Root Causes
          </h3>

          <p
            className="
              mt-4 text-slate-300
            "
          >
            AI analysis found no operational degradation patterns requiring root
            cause investigation.
          </p>
        </div>
      )}

      {/* CAUSES */}

      <div
        className="
          mt-10 space-y-6
        "
      >
        {causes.map((cause, index) => (
          <motion.div
            key={`${cause.title}-${index}`}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.08,
            }}
            className="
                rounded-[28px]
                border border-red-500/20
                bg-red-500/5
                p-7
              "
          >
            <div
              className="
                  flex flex-wrap
                  items-start
                  justify-between
                  gap-6
                "
            >
              {/* LEFT */}

              <div
                className="
                    flex-1
                  "
              >
                <div
                  className="
                      flex flex-wrap
                      gap-3
                    "
                >
                  <div
                    className="
                        rounded-full
                        bg-black/20
                        px-4 py-2
                        text-xs font-bold
                        uppercase
                        tracking-[0.2em]
                      "
                  >
                    Root Cause
                  </div>

                  <div
                    className="
                        rounded-full
                        bg-black/20
                        px-4 py-2
                        text-xs font-bold
                        uppercase
                        tracking-[0.2em]
                      "
                  >
                    {cause.confidence}% Confidence
                  </div>
                </div>

                <h3
                  className="
                      mt-6 text-3xl
                      font-black
                    "
                >
                  {cause.title}
                </h3>

                <p
                  className="
                      mt-5 leading-8
                      text-slate-300
                    "
                >
                  {cause.description}
                </p>

                <div
                  className="
                      mt-6 rounded-2xl
                      border border-white/10
                      bg-black/20
                      p-5
                    "
                >
                  <p
                    className="
                        text-sm uppercase
                        tracking-[0.2em]
                        text-cyan-300
                      "
                  >
                    Operational Impact
                  </p>

                  <p
                    className="
                        mt-3 leading-8
                        text-slate-300
                      "
                  >
                    {cause.impact}
                  </p>
                </div>
              </div>

              {/* RIGHT */}

              <div
                className="
                    w-full
                    max-w-[220px]
                  "
              >
                <div
                  className="
                      rounded-[28px]
                      border border-white/10
                      bg-black/20
                      p-6
                    "
                >
                  <div
                    className="
                        flex items-center
                        justify-between
                      "
                  >
                    <Search
                      className="
                          h-6 w-6
                        "
                    />

                    <AlertTriangle
                      className="
                          h-6 w-6
                        "
                    />
                  </div>

                  <p
                    className="
                        mt-6 text-sm
                        uppercase
                        tracking-[0.2em]
                      "
                  >
                    Confidence
                  </p>

                  <h2
                    className="
                        mt-4 text-5xl
                        font-black
                      "
                  >
                    {cause.confidence}%
                  </h2>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
