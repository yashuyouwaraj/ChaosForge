"use client";

import { motion } from "framer-motion";

import { useRunAiInsights } from "@/hooks/useRunAiInsights";

import { useRun } from "@/components/providers/RunProvider";

const styles = {
  info:
    "border-cyan-500/20 bg-cyan-500/5 text-cyan-300",

  warning:
    "border-yellow-500/20 bg-yellow-500/5 text-yellow-300",

  critical:
    "border-red-500/20 bg-red-500/5 text-red-300",
};

export function RunAiInsights() {
  const { selectedRun } =
    useRun();

  const {
    insights,
    intelligence,
  } =
    useRunAiInsights(
      selectedRun.projectId,
      selectedRun.runId,
    );

  return (
    <div className="space-y-6">
      {intelligence && (
        <div className="glass rounded-[28px] border border-cyan-500/20 bg-cyan-500/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            Operational Intelligence
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["Current Health", intelligence.currentHealth],
              ["Risk Level", intelligence.riskLevel],
              ["Most Probable Issue", intelligence.mostProbableIssue],
              ["Predicted Failure", intelligence.predictedFailure],
              ["Confidence", intelligence.confidence],
              ["Recommendation", intelligence.recommendation],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {label}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-200">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.length === 0 && (
        <div
          className="
            glass rounded-[28px]
            p-10 text-center
          "
        >
          <h3
            className="
              text-2xl font-bold
            "
          >
            AI Operations Stable
          </h3>

          <p
            className="
              mt-3 text-muted-foreground
            "
          >
            No operational anomalies
            detected for the active
            simulation run.
          </p>
        </div>
      )}

      {insights.map(
        (
          insight,
          index,
        ) => (
          <motion.div
            key={
              insight.title
            }
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay:
                index * 0.08,
            }}
            className={`
              glass rounded-[28px]
              border p-6
              ${
                styles[
                  insight.severity
                ]
              }
            `}
          >
            <div
              className="
                flex items-start
                justify-between gap-4
              "
            >
              <div>
                {/* BADGES */}

                <div
                  className="
                    flex flex-wrap
                    items-center gap-3
                  "
                >
                  {/* SEVERITY */}

                  <div
                    className="
                      inline-flex
                      rounded-full
                      bg-white/5
                      px-3 py-1
                      text-xs font-semibold
                      uppercase
                      tracking-[0.2em]
                    "
                  >
                    {
                      insight.severity
                    }
                  </div>

                  {/* TYPE */}

                  <div
                    className="
                      inline-flex
                      rounded-full
                      bg-white/5
                      px-3 py-1
                      text-xs font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-slate-300
                    "
                  >
                    {insight.type}
                  </div>
                </div>

                {/* TITLE */}

                <h3
                  className="
                    mt-5 text-2xl
                    font-bold
                  "
                >
                  {
                    insight.title
                  }
                </h3>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-4 leading-7
                    text-slate-300
                  "
                >
                  {
                    insight.description
                  }
                </p>

                {/* RECOMMENDATION */}

                {insight.recommendation && (
                  <div
                    className="
                      mt-5 rounded-2xl
                      border border-white/10
                      bg-black/20
                      p-4
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-cyan-300
                      "
                    >
                      Recommendation
                    </p>

                    <p
                      className="
                        mt-2 text-sm
                        text-muted-foreground
                      "
                    >
                      {
                        insight.recommendation
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* AI ICON */}

              <div
                className="
                  flex h-12 w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/5
                  text-xl
                "
              >
                🧠
              </div>
            </div>
          </motion.div>
        ),
      )}
    </div>
  );
}
