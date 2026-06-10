"use client";

import { motion } from "framer-motion";
import { Briefcase, Shield, TrendingUp, AlertTriangle } from "lucide-react";

import { useExecutiveBrief } from "@/hooks/useExecutiveBrief";

const STATUS_STYLES = {
  Excellent: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    text: "text-emerald-300",
  },

  Good: {
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
    text: "text-cyan-300",
  },

  Warning: {
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
    text: "text-yellow-300",
  },

  Critical: {
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    text: "text-red-300",
  },
};

export function ExecutiveBriefCenter({ projectId, runId, run }) {
  const brief = useExecutiveBrief(projectId, runId, run);

  const style = STATUS_STYLES[brief.assessment] || STATUS_STYLES.Good;

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
          <p
            className="
              text-sm uppercase
              tracking-[0.3em]
              text-cyan-400
            "
          >
            Leadership Intelligence
          </p>

          <h2
            className="
              mt-3 text-4xl
              font-black
            "
          >
            Executive Brief
          </h2>

          <p
            className="
              mt-4 max-w-3xl
              text-muted-foreground
            "
          >
            High-level operational assessment generated from infrastructure
            health, predictive intelligence, root cause analysis and distributed
            system performance indicators.
          </p>
        </div>

        <Briefcase
          className="
            h-10 w-10
            text-cyan-400
          "
        />
      </div>

      {/* HERO */}

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className={`
          mt-10 rounded-[30px]
          border p-8
          ${style.border}
          ${style.bg}
        `}
      >
        <div
          className="
            grid gap-6
            md:grid-cols-3
          "
        >
          {/* Assessment */}

          <div>
            <p
              className="
                text-xs uppercase
                tracking-[0.2em]
                text-slate-400
              "
            >
              Assessment
            </p>

            <h3
              className={`
                mt-3 text-4xl
                font-black
                ${style.text}
              `}
            >
              {brief.assessment}
            </h3>
          </div>

          {/* Score */}

          <div>
            <p
              className="
                text-xs uppercase
                tracking-[0.2em]
                text-slate-400
              "
            >
              Health Score
            </p>

            <h3
              className="
                mt-3 text-4xl
                font-black
              "
            >
              {brief.score}/100
            </h3>
          </div>

          {/* Impact */}

          <div>
            <p
              className="
                text-xs uppercase
                tracking-[0.2em]
                text-slate-400
              "
            >
              Business Impact
            </p>

            <h3
              className="
                mt-3 text-4xl
                font-black
              "
            >
              {brief.impact}
            </h3>
          </div>
        </div>

        {/* ACTION */}

        <div
          className="
            mt-8 rounded-2xl
            border border-white/10
            bg-black/20
            p-6
          "
        >
          <div
            className="
              flex items-center
              gap-3
            "
          >
            <Shield
              className="
                h-5 w-5
                text-cyan-400
              "
            />

            <h4
              className="
                font-bold
              "
            >
              Recommended Action
            </h4>
          </div>

          <p
            className="
              mt-4 leading-7
              text-slate-300
            "
          >
            {brief.action}
          </p>
        </div>
      </motion.div>

      {/* FINDINGS */}

      <div
        className="
          mt-10
        "
      >
        <div
          className="
            flex items-center
            gap-3
          "
        >
          <TrendingUp
            className="
              h-5 w-5
              text-cyan-400
            "
          />

          <h3
            className="
              text-2xl
              font-black
            "
          >
            Key Findings
          </h3>
        </div>

        <div
          className="
            mt-6 grid gap-4
            md:grid-cols-2
          "
        >
          {brief.findings.map((finding, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 10,
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
              <div
                className="
                    flex items-start
                    gap-4
                  "
              >
                <AlertTriangle
                  className="
                      mt-1 h-4 w-4
                      text-cyan-400
                    "
                />

                <p
                  className="
                      text-slate-300
                      leading-7
                    "
                >
                  {finding}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
