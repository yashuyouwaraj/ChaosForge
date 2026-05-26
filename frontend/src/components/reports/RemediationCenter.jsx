"use client";

import { motion } from "framer-motion";

import { ShieldCheck, Wrench, Activity } from "lucide-react";

import { useRemediationRecommendations } from "@/hooks/useRemediationRecommendations";

const priorityStyles = {
  low: `
    border-green-500/20
    bg-green-500/5
    text-green-300
  `,

  high: `
    border-yellow-500/20
    bg-yellow-500/5
    text-yellow-300
  `,

  critical: `
    border-red-500/20
    bg-red-500/5
    text-red-300
  `,
};

export function RemediationCenter({ projectId, runId }) {
  const recommendations = useRemediationRecommendations(projectId, runId);

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
            Autonomous Remediation Center
          </h3>

          <p
            className="
              mt-3 max-w-3xl
              text-muted-foreground
            "
          >
            AI-generated operational remediation guidance based on
            infrastructure anomalies, predictive intelligence, and regression
            analysis.
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
          {recommendations.length} Recommendations
        </div>
      </div>

      {/* RECOMMENDATIONS */}

      <div
        className="
          mt-10 space-y-6
        "
      >
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={`${recommendation.category}-${index}`}
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
                ${priorityStyles[recommendation.priority]}
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
                    {recommendation.priority}
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
                    AI Generated
                  </div>
                </div>

                {/* TITLE */}

                <h3
                  className="
                      mt-6 text-3xl
                      font-black
                    "
                >
                  {recommendation.category}
                </h3>

                {/* ACTION */}

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
                    Recommended Action
                  </p>

                  <p
                    className="
                        mt-3 leading-8
                        text-slate-300
                      "
                  >
                    {recommendation.action}
                  </p>
                </div>

                {/* REASON */}

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
                    Operational Reasoning
                  </p>

                  <p
                    className="
                        mt-3 leading-8
                        text-slate-300
                      "
                  >
                    {recommendation.reason}
                  </p>
                </div>

                {/* IMPACT */}

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
                    Expected Impact
                  </p>

                  <p
                    className="
                        mt-3 leading-8
                        text-slate-300
                      "
                  >
                    {recommendation.impact}
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
                    <Wrench
                      className="
                          h-6 w-6
                        "
                    />

                    <ShieldCheck
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
                    Operational Priority
                  </p>

                  <h2
                    className="
                        mt-4 text-5xl
                        font-black
                      "
                  >
                    {recommendation.priority}
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

                    <span>AI remediation guidance active</span>
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
