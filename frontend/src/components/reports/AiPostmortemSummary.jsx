"use client";

import { motion } from "framer-motion";

import { useAiPostmortemSummary } from "@/hooks/useAiPostmortemSummary";

const gradeStyles = {
  A: "text-green-400 border-green-500/20 bg-green-500/5",

  B: "text-cyan-300 border-cyan-500/20 bg-cyan-500/5",

  C: "text-yellow-300 border-yellow-500/20 bg-yellow-500/5",

  D: "text-red-300 border-red-500/20 bg-red-500/5",
};

export function AiPostmortemSummary({ incidents, run, runId }) {
  const intelligence = useAiPostmortemSummary(runId, run, incidents);

  if (!intelligence) {
    return null;
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
          flex items-start
          justify-between gap-6
        "
      >
        <div>
          <p
            className="
              text-sm uppercase
              tracking-[0.3em]
              text-cyan-400
            "
          >
            AI Infrastructure Intelligence
          </p>

          <h2
            className="
              mt-4 text-4xl
              font-black
            "
          >
            Operational Postmortem
          </h2>

          <p
            className="
              mt-4 max-w-3xl
              leading-8
              text-slate-300
            "
          >
            {intelligence.summary}
          </p>
        </div>

        <div
          className="
            flex h-20 w-20
            items-center justify-center
            rounded-[28px]
            bg-cyan-500/10
            text-4xl
          "
        >
          🧠
        </div>
      </div>

      {/* METRICS */}

      <div
        className="
    mt-10 grid gap-5
    md:grid-cols-2
    xl:grid-cols-6
  "
      >
        {/* RISK */}

        <div
          className="
      rounded-2xl
      border border-red-500/20
      bg-red-500/5
      p-6
    "
        >
          <p
            className="
        text-sm uppercase
        tracking-[0.2em]
        text-red-300
      "
          >
            Risk Score
          </p>

          <h3
            className="
        mt-4 text-5xl
        font-black text-red-300
      "
          >
            {intelligence.riskScore}
          </h3>
        </div>

        {/* GRADE */}

        <div
          className={`
      rounded-2xl
      border p-6
      ${gradeStyles[intelligence.grade]}
    `}
        >
          <p
            className="
        text-sm uppercase
        tracking-[0.2em]
      "
          >
            Reliability
          </p>

          <h3
            className="
        mt-4 text-5xl
        font-black
      "
          >
            {intelligence.grade}
          </h3>
        </div>

        {/* CONFIDENCE */}

        <div
          className="
      rounded-2xl
      border border-cyan-500/20
      bg-cyan-500/5
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
            AI Confidence
          </p>

          <h3
            className="
        mt-4 text-5xl
        font-black text-cyan-300
      "
          >
            {intelligence.confidence}%
          </h3>
        </div>

        {/* STATE */}

        <div
          className="
      rounded-2xl
      border border-yellow-500/20
      bg-yellow-500/5
      p-6
    "
        >
          <p
            className="
        text-sm uppercase
        tracking-[0.2em]
        text-yellow-300
      "
          >
            Operational State
          </p>

          <h3
            className="
        mt-4 text-3xl
        font-black text-yellow-300
      "
          >
            {intelligence.operationalState}
          </h3>
        </div>

        {/* SUCCESS */}

        <div
          className="
      rounded-2xl
      border border-green-500/20
      bg-green-500/5
      p-6
    "
        >
          <p
            className="
        text-sm uppercase
        tracking-[0.2em]
        text-green-300
      "
          >
            Success Rate
          </p>

          <h3
            className="
        mt-4 text-5xl
        font-black text-green-300
      "
          >
            {intelligence.successRate}%
          </h3>
        </div>

        {/* FAILURE */}

        <div
          className="
      rounded-2xl
      border border-yellow-500/20
      bg-yellow-500/5
      p-6
    "
        >
          <p
            className="
        text-sm uppercase
        tracking-[0.2em]
        text-yellow-300
      "
          >
            Failure Rate
          </p>

          <h3
            className="
        mt-4 text-5xl
        font-black text-yellow-300
      "
          >
            {intelligence.failureRate}%
          </h3>
        </div>
      </div>

      {/* INSIGHTS */}

      <div className="mt-10">
        <h3
          className="
            text-2xl font-black
          "
        >
          AI Operational Insights
        </h3>

        <div className="mt-6 space-y-4">
          {intelligence.insights.map((insight, index) => (
            <motion.div
              key={index}
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

      {/* RECOMMENDATIONS */}

      <div className="mt-10">
        <h3
          className="
            text-2xl font-black
          "
        >
          Infrastructure Recommendations
        </h3>

        <div className="mt-6 space-y-4">
          {intelligence.recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
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
                  rounded-2xl
                  border border-cyan-500/20
                  bg-cyan-500/5
                  p-5
                "
            >
              <p
                className="
                    leading-7
                    text-slate-300
                  "
              >
                {recommendation}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
