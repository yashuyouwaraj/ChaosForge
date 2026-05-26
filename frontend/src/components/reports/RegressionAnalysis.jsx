"use client";

import { motion } from "framer-motion";

import { useRegressionAnalysis } from "@/hooks/useRegressionAnalysis";

const deltaStyles = {
  positive: `
    border-green-500/20
    bg-green-500/5
    text-green-300
  `,

  negative: `
    border-red-500/20
    bg-red-500/5
    text-red-300
  `,

  neutral: `
    border-cyan-500/20
    bg-cyan-500/5
    text-cyan-300
  `,
};

const trendStyles = {
  "No baseline": `
    border-slate-500/20
    bg-slate-500/10
    text-slate-300
  `,

  Improved: `
    border-green-500/20
    bg-green-500/10
    text-green-300
  `,

  Stable: `
    border-cyan-500/20
    bg-cyan-500/10
    text-cyan-300
  `,

  Degraded: `
    border-red-500/20
    bg-red-500/10
    text-red-300
  `,
};

const getDeltaType = (value, reverse = false) => {
  if (value == null || value === 0) {
    return "neutral";
  }

  if (reverse) {
    return value < 0 ? "positive" : "negative";
  }

  return value > 0 ? "positive" : "negative";
};

const formatDelta = (value, unit = "%") => {
  if (value == null) {
    return "N/A";
  }

  return `${value}${unit}`;
};

export function RegressionAnalysis({ projectId, runId }) {
  const analysis = useRegressionAnalysis(projectId, runId);

  if (!analysis) {
    return null;
  }

  const { operationalTrend, narrative, insights, deltas, hasPreviousRun } =
    analysis;

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
            Regression Intelligence
          </h3>

          <p
            className="
              mt-3 max-w-3xl
              text-muted-foreground
            "
          >
            Comparative operational intelligence across distributed
            infrastructure executions.
          </p>
        </div>

        <div
          className={`
            rounded-full
            border px-5 py-3
            text-sm font-bold
            uppercase
            tracking-[0.2em]
            ${trendStyles[operationalTrend]}
          `}
        >
          {operationalTrend}
        </div>
      </div>

      {/* NARRATIVE */}

      <div
        className="
          mt-8 rounded-[28px]
          border border-white/10
          bg-black/20
          p-6
        "
      >
        <p
          className="
            text-sm uppercase
            tracking-[0.2em]
            text-cyan-300
          "
        >
          AI Comparative Narrative
        </p>

        <p
          className="
            mt-5 text-lg
            leading-8
            text-slate-300
          "
        >
          {narrative}
        </p>
      </div>

      {/* DELTAS */}

      {hasPreviousRun && deltas ? (
        <div
          className="
            mt-8 grid gap-5
            md:grid-cols-2
            xl:grid-cols-5
          "
        >
        {/* P95 */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className={`
              rounded-2xl
              border p-6
              ${deltaStyles[getDeltaType(deltas.p95Latency, true)]}
            `}
          >
            <p
              className="
                text-xs uppercase
                tracking-[0.2em]
              "
            >
              P95 Latency
            </p>

            <h3
              className="
                mt-4 text-5xl
                font-black
              "
            >
              {formatDelta(deltas.p95Latency)}
            </h3>
          </motion.div>

        {/* AVG */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.05,
            }}
            className={`
              rounded-2xl
              border p-6
              ${deltaStyles[getDeltaType(deltas.avgLatency, true)]}
            `}
          >
            <p
              className="
                text-xs uppercase
                tracking-[0.2em]
              "
            >
              Avg Latency
            </p>

            <h3
              className="
                mt-4 text-5xl
                font-black
              "
            >
              {formatDelta(deltas.avgLatency)}
            </h3>
          </motion.div>

        {/* FAILURE */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className={`
              rounded-2xl
              border p-6
              ${deltaStyles[getDeltaType(deltas.failure, true)]}
            `}
          >
            <p
              className="
                text-xs uppercase
                tracking-[0.2em]
              "
            >
              Failure Rate
            </p>

            <h3
              className="
                mt-4 text-5xl
                font-black
              "
            >
              {formatDelta(deltas.failure, "%")}
            </h3>
          </motion.div>

        {/* RPS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className={`
              rounded-2xl
              border p-6
              ${deltaStyles[getDeltaType(deltas.rps)]}
            `}
          >
            <p
              className="
                text-xs uppercase
                tracking-[0.2em]
              "
            >
              Throughput
            </p>

            <h3
              className="
                mt-4 text-5xl
                font-black
              "
            >
              {formatDelta(deltas.rps)}
            </h3>
          </motion.div>

        {/* SUCCESS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className={`
              rounded-2xl
              border p-6
              ${deltaStyles[getDeltaType(deltas.successRate)]}
            `}
          >
            <p
              className="
                text-xs uppercase
                tracking-[0.2em]
              "
            >
              Success Rate
            </p>

            <h3
              className="
                mt-4 text-5xl
                font-black
              "
            >
              {formatDelta(deltas.successRate, "%")}
            </h3>
          </motion.div>
        </div>
      ) : null}

      {/* INSIGHTS */}

      <div
        className="
          mt-8 space-y-4
        "
      >
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: index * 0.08,
            }}
            className="
                rounded-2xl
                border border-white/10
                bg-black/20
                p-5
              "
          >
            <p
              className="
                  leading-7
                  text-slate-300
                "
            >
              {insight}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
