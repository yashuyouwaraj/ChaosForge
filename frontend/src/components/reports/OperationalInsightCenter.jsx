"use client";

import { motion } from "framer-motion";

import { BrainCircuit, ShieldAlert, Activity } from "lucide-react";

import { useOperationalInsights } from "@/hooks/useOperationalInsights";

const severityStyles = {
  info: `
    border-cyan-500/20
    bg-cyan-500/5
    text-cyan-300
  `,

  moderate: `
    border-yellow-500/20
    bg-yellow-500/5
    text-yellow-300
  `,

  high: `
    border-orange-500/20
    bg-orange-500/5
    text-orange-300
  `,

  critical: `
    border-red-500/20
    bg-red-500/5
    text-red-300
  `,
};

export function OperationalInsightCenter({ projectId, runId, run = null }) {
  const {
    insights,
    loading,
    error,
  } = useOperationalInsights(projectId, runId, run);

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
            Unified Operational Intelligence
          </h3>

          <p
            className="
              mt-3 max-w-3xl
              text-muted-foreground
            "
          >
            Centralized AI operational reasoning across predictive intelligence,
            anomaly detection, remediation workflows, and infrastructure memory
            systems.
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
          {loading
            ? "Loading Insights"
            : `${insights.length} Active Insights`}
        </div>
      </div>

      {error && (
        <div
          className="
            mt-10 rounded-[28px]
            border border-red-500/20
            bg-red-500/5
            p-8 text-red-200
          "
        >
          {error}
        </div>
      )}

      {loading && !error && (
        <div
          className="
            mt-10 rounded-[28px]
            border border-white/10
            bg-black/20
            p-8 text-slate-300
          "
        >
          Loading operational insights...
        </div>
      )}

      {/* INSIGHTS */}

      <div
        className="
          mt-10 space-y-6
        "
      >
        {!loading && !error && insights.map((insight, index) => (
          <motion.div
            key={insight.title}
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
            className={`
                rounded-[28px]
                border p-7
                ${severityStyles[insight.severity]}
              `}
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
                {/* BADGES */}

                <div
                  className="
                      flex flex-wrap
                      items-center
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
                    {insight.severity}
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
                    Unified AI Reasoning
                  </div>
                </div>

                {/* TITLE */}

                <h3
                  className="
                      mt-6 text-3xl
                      font-black
                    "
                >
                  {insight.title}
                </h3>

                {/* DESCRIPTION */}

                <p
                  className="
                      mt-5 max-w-4xl
                      leading-8
                      text-slate-300
                    "
                >
                  {insight.description}
                </p>

                {/* RECOMMENDATION */}

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
                    AI Operational Guidance
                  </p>

                  <p
                    className="
                        mt-3 leading-8
                        text-slate-300
                      "
                  >
                    {insight.recommendation}
                  </p>
                </div>
              </div>

              {/* RIGHT */}

              <div
                className="
                    w-full max-w-[240px]
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
                    <BrainCircuit
                      className="
                          h-6 w-6
                        "
                    />

                    <ShieldAlert
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
                    Intelligence Layer
                  </p>

                  <h2
                    className="
                        mt-4 text-4xl
                        font-black
                      "
                  >
                    Active
                  </h2>

                  <div
                    className="
                        mt-6 flex
                        items-center gap-3
                        text-sm
                      "
                  >
                    <Activity
                      className="
                          h-4 w-4
                        "
                    />

                    <span>Multi-system AI operational reasoning active</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
