"use client";

import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, Activity } from "lucide-react";

import { useAnomalyDetection } from "@/hooks/useAnomalyDetection";
import { useIntelligence } from "@/hooks/useIntelligence";

const severityStyles = {
  info: `
    border-cyan-500/20
    bg-cyan-500/5
    text-cyan-300
  `,

  warning: `
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

export function AnomalyCenter({ projectId, runId }) {
  const { loading } = useIntelligence(projectId, runId);
  const anomalies = useAnomalyDetection(projectId, runId);

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
            AI-powered anomaly detection generated from simulation performance
            metrics and infrastructure telemetry.
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
          {loading ? "Analyzing..." : `${anomalies.length} Active Anomalies`}
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div
          className="
            mt-10 rounded-[28px]
            border border-cyan-500/20
            bg-cyan-500/5
            p-10 text-center
          "
        >
          Generating anomaly analysis...
        </div>
      )}

      {/* EMPTY */}

      {!loading && anomalies.length === 0 && (
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
            No operational anomalies detected during this simulation execution.
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
            key={`${anomaly.title}-${index}`}
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
                ${severityStyles[anomaly.severity] || severityStyles.warning}
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
                      flex items-center
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
                  {anomaly.title}
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
                      border
                      border-white/10
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
                    Severity
                  </p>

                  <h2
                    className="
                        mt-4 text-4xl
                        font-black
                      "
                  >
                    {anomaly.severity}
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
