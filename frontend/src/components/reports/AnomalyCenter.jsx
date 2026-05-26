"use client";

import { motion } from "framer-motion";

import { ShieldAlert, AlertTriangle, Activity } from "lucide-react";

import { useAnomalyDetection } from "@/hooks/useAnomalyDetection";

const severityStyles = {
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

export function AnomalyCenter({ projectId, runId, run = null }) {
  const anomalies = useAnomalyDetection(projectId, runId, run);

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
            Autonomous Anomaly Center
          </h3>

          <p
            className="
              mt-3 max-w-3xl
              text-muted-foreground
            "
          >
            AI-driven infrastructure anomaly detection across distributed
            operational telemetry streams.
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
          {anomalies.length} Active Anomalies
        </div>
      </div>

      {/* EMPTY */}

      {anomalies.length === 0 && (
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
            <ShieldAlert
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
            Infrastructure Stable
          </h3>

          <p
            className="
              mt-4 max-w-2xl
              mx-auto leading-7
              text-slate-300
            "
          >
            No significant operational anomalies detected across distributed
            telemetry and infrastructure execution patterns.
          </p>
        </div>
      )}

      {/* ANOMALIES */}

      <div
        className="
          mt-10 space-y-6
        "
      >
        {anomalies.map((anomaly, index) => (
          <motion.div
            key={anomaly.type}
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
                ${severityStyles[anomaly.severity]}
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
                    {anomaly.severity}
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
                    AI Detected
                  </div>
                </div>

                <h3
                  className="
                      mt-6 text-3xl
                      font-black
                    "
                >
                  {anomaly.type}
                </h3>

                <p
                  className="
                      mt-4 max-w-3xl
                      leading-8
                      text-slate-300
                    "
                >
                  {anomaly.description}
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
                    Recommended Action
                  </p>

                  <p
                    className="
                        mt-3 leading-7
                        text-slate-300
                      "
                  >
                    {anomaly.recommendation}
                  </p>
                </div>
              </div>

              {/* RIGHT */}

              <div
                className="
                    w-full max-w-[220px]
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
                    <Activity
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
                    Operational Deviation
                  </p>

                  <h2
                    className="
                        mt-4 text-6xl
                        font-black
                      "
                  >
                    {anomaly.score}%
                  </h2>

                  {/* BAR */}

                  <div
                    className="
                        mt-6 h-3
                        overflow-hidden
                        rounded-full
                        bg-black/30
                      "
                  >
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${anomaly.score}%`,
                      }}
                      transition={{
                        duration: 1,
                      }}
                      className="
                          h-full rounded-full
                          bg-current
                        "
                    />
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
