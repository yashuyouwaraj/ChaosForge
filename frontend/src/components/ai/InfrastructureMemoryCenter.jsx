"use client";

import { motion } from "framer-motion";

import { Brain, Database, ShieldAlert } from "lucide-react";

import { useInfrastructureMemory } from "@/hooks/useInfrastructureMemory";

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

export function InfrastructureMemoryCenter({ projectId }) {
  const {
    memory,
    loading,
    error,
  } = useInfrastructureMemory(projectId);

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
            Infrastructure Memory Intelligence
          </h3>

          <p
            className="
              mt-3 max-w-3xl
              text-muted-foreground
            "
          >
            Historical operational learning and recurring infrastructure pattern
            detection across distributed execution environments.
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
            ? "Loading Memory"
            : `${memory.length} Learned Patterns`}
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
          Loading infrastructure memory...
        </div>
      )}

      {/* EMPTY */}

      {!loading && !error && memory.length === 0 && (
        <div
          className="
            mt-10 rounded-[28px]
            border border-green-500/20
            bg-green-500/5
            p-10 text-center
          "
        >
          <div
            className="
              mx-auto flex
              h-20 w-20
              items-center
              justify-center
              rounded-3xl
              bg-green-500/10
              text-green-300
            "
          >
            <Brain
              className="
                h-10 w-10
              "
            />
          </div>

          <h3
            className="
              mt-6 text-3xl
              font-black
              text-green-300
            "
          >
            Operational Memory Stable
          </h3>

          <p
            className="
              mt-4 max-w-2xl
              mx-auto leading-7
              text-slate-300
            "
          >
            No recurring infrastructure degradation signatures detected across
            historical distributed executions.
          </p>
        </div>
      )}

      {/* MEMORY ENTRIES */}

      <div
        className="
          mt-10 space-y-6
        "
      >
        {!loading && !error && memory.map((insight, index) => (
          <motion.div
            key={insight.type}
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
                    Historical Pattern
                  </div>
                </div>

                {/* TITLE */}

                <h3
                  className="
                      mt-6 text-3xl
                      font-black
                    "
                >
                  {insight.type}
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

                {/* IMPACT */}

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
                    {insight.impact}
                  </p>
                </div>

                {/* RECOMMENDATION */}

                <div
                  className="
                      mt-5 rounded-2xl
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
                    Learned Recommendation
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
                    <Database
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
                    Learning Status
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
                        mt-6 text-sm
                        leading-6
                      "
                  >
                    Historical operational intelligence pattern recognized.
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
