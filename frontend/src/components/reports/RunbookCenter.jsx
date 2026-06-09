"use client";

import { motion } from "framer-motion";
import { ClipboardList, ArrowDown, CheckCircle2 } from "lucide-react";

import { useRunbookGeneration } from "@/hooks/useRunbookGeneration";

export function RunbookCenter({ projectId, runId }) {
  const runbook = useRunbookGeneration(projectId, runId);

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
            Autonomous Recovery Runbook
          </h3>

          <p
            className="
              mt-3 max-w-3xl
              text-muted-foreground
            "
          >
            AI-generated recovery workflow derived from root cause analysis,
            anomaly intelligence and remediation recommendations.
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
          {runbook.length} Steps
        </div>
      </div>

      {/* EMPTY */}

      {runbook.length === 0 && (
        <div
          className="
            mt-10 rounded-[28px]
            border border-green-500/20
            bg-green-500/5
            p-10 text-center
          "
        >
          <CheckCircle2
            className="
              mx-auto h-12 w-12
              text-green-400
            "
          />

          <h3
            className="
              mt-5 text-2xl
              font-black
              text-green-300
            "
          >
            No Recovery Actions Required
          </h3>

          <p
            className="
              mt-3 text-slate-300
            "
          >
            Infrastructure appears stable.
          </p>
        </div>
      )}

      {/* STEPS */}

      <div
        className="
          mt-10 space-y-4
        "
      >
        {runbook.map((step, index) => (
          <motion.div
            key={step.order}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.05,
            }}
          >
            <div
              className="
                  rounded-[28px]
                  border border-cyan-500/20
                  bg-cyan-500/5
                  p-6
                "
            >
              <div
                className="
                    flex items-start
                    gap-5
                  "
              >
                <div
                  className="
                      flex h-12 w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-cyan-500/10
                      text-cyan-300
                      font-bold
                    "
                >
                  {step.order}
                </div>

                <div className="flex-1">
                  <h3
                    className="
                        text-xl
                        font-bold
                      "
                  >
                    {step.title}
                  </h3>

                  <p
                    className="
                        mt-3
                        text-slate-300
                        leading-7
                      "
                  >
                    {step.description}
                  </p>
                </div>

                <ClipboardList
                  className="
                      h-6 w-6
                      text-cyan-400
                    "
                />
              </div>
            </div>

            {index < runbook.length - 1 && (
              <div
                className="
                    flex justify-center
                    py-2
                  "
              >
                <ArrowDown
                  className="
                      h-5 w-5
                      text-cyan-400
                    "
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
