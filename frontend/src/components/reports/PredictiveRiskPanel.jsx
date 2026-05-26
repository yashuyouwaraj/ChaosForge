"use client";

import { motion } from "framer-motion";

import { ShieldAlert, Activity, TrendingUp } from "lucide-react";

import { usePredictiveRisk } from "@/hooks/usePredictiveRisk";

const riskStyles = {
  Stable: `
    border-green-500/20
    bg-green-500/5
    text-green-300
  `,

  Moderate: `
    border-yellow-500/20
    bg-yellow-500/5
    text-yellow-300
  `,

  High: `
    border-orange-500/20
    bg-orange-500/5
    text-orange-300
  `,

  Critical: `
    border-red-500/20
    bg-red-500/5
    text-red-300
  `,
};

export function PredictiveRiskPanel({ projectId, runId }) {
  const prediction = usePredictiveRisk(projectId, runId);

  if (!prediction) {
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
            Predictive Risk Intelligence
          </h3>

          <p
            className="
              mt-3 max-w-3xl
              text-muted-foreground
            "
          >
            AI-powered operational forecasting based on distributed
            infrastructure telemetry and regression intelligence.
          </p>
        </div>

        <div
          className={`
            rounded-full
            border px-5 py-3
            text-sm font-bold
            uppercase
            tracking-[0.2em]
            ${riskStyles[prediction.level]}
          `}
        >
          {prediction.level}
        </div>
      </div>

      {/* MAIN GRID */}

      <div
        className="
          mt-10 grid gap-6
          xl:grid-cols-[1.2fr,0.8fr]
        "
      >
        {/* LEFT */}

        <div
          className="
            rounded-[28px]
            border border-white/10
            bg-black/20
            p-7
          "
        >
          <div
            className="
              flex items-center
              gap-4
            "
          >
            <div
              className="
                flex h-14 w-14
                items-center
                justify-center
                rounded-2xl
                bg-red-500/10
                text-red-300
              "
            >
              <ShieldAlert
                className="
                  h-7 w-7
                "
              />
            </div>

            <div>
              <p
                className="
                  text-sm uppercase
                  tracking-[0.2em]
                  text-slate-400
                "
              >
                Predicted Infrastructure Risk
              </p>

              <h2
                className="
                  mt-2 text-6xl
                  font-black
                "
              >
                {prediction.risk}%
              </h2>
            </div>
          </div>

          {/* BAR */}

          <div
            className="
              mt-8 h-4
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
                width: `${prediction.risk}%`,
              }}
              transition={{
                duration: 1,
              }}
              className={`
                h-full rounded-full
                ${
                  prediction.risk >= 75
                    ? "bg-red-500"
                    : prediction.risk >= 50
                      ? "bg-orange-500"
                      : prediction.risk >= 30
                        ? "bg-yellow-500"
                        : "bg-green-500"
                }
              `}
            />
          </div>

          {/* FORECAST */}

          <div
            className="
              mt-8 rounded-2xl
              border border-white/10
              bg-black/30
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
              Operational Forecast
            </p>

            <p
              className="
                mt-4 text-lg
                leading-8
                text-slate-300
              "
            >
              {prediction.forecast}
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div
          className="
            space-y-5
          "
        >
          {/* DRIVERS */}

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
                gap-3
              "
            >
              <TrendingUp
                className="
                  h-6 w-6
                  text-cyan-300
                "
              />

              <h3
                className="
                  text-xl
                  font-bold
                "
              >
                Predictive Drivers
              </h3>
            </div>

            <div
              className="
                mt-6 space-y-4
              "
            >
              {prediction.drivers.map((driver, index) => (
                <motion.div
                  key={driver}
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
                      p-4
                    "
                >
                  <p
                    className="
                        text-slate-300
                      "
                  >
                    {driver}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* STATUS */}

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
                gap-3
              "
            >
              <Activity
                className="
                  h-6 w-6
                  text-cyan-300
                "
              />

              <h3
                className="
                  text-xl
                  font-bold
                "
              >
                AI Operational Status
              </h3>
            </div>

            <div
              className="
                mt-6 flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-slate-400
                "
              >
                Prediction Level
              </span>

              <span
                className={`
                  rounded-full
                  px-4 py-2
                  text-sm font-bold
                  ${riskStyles[prediction.level]}
                `}
              >
                {prediction.level}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
