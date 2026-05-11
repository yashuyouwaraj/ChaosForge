"use client";

import { motion } from "framer-motion";

const alerts = [
  {
    severity: "critical",
    title: "Redis pressure spike",
    description:
      "Redis request throughput exceeded safe threshold.",
    time: "1m ago",
  },

  {
    severity: "warning",
    title: "Kafka consumer lag",
    description:
      "Worker-3 event consumption latency increasing.",
    time: "3m ago",
  },

  {
    severity: "info",
    title: "Autoscaling triggered",
    description:
      "Simulation infrastructure scaled successfully.",
    time: "8m ago",
  },
];

const styles = {
  critical: {
    border:
      "border-red-500/20",

    bg:
      "bg-red-500/5",

    text:
      "text-red-300",

    badge:
      "bg-red-500/10 text-red-300",
  },

  warning: {
    border:
      "border-yellow-500/20",

    bg:
      "bg-yellow-500/5",

    text:
      "text-yellow-400",

    badge:
      "bg-yellow-500/10 text-yellow-400",
  },

  info: {
    border:
      "border-cyan-500/20",

    bg:
      "bg-cyan-500/5",

    text:
      "text-cyan-300",

    badge:
      "bg-cyan-500/10 text-cyan-300",
  },
};

export function AlertCenter() {
  return (
    <div
      className="
        grid gap-6
        xl:grid-cols-3
      "
    >
      {alerts.map((alert, index) => {
        const style =
          styles[alert.severity];

        return (
          <motion.div
            key={alert.title}

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
              glass rounded-[28px]
              border p-6
              ${style.border}
              ${style.bg}
            `}
          >
            <div
              className="
                flex items-start
                justify-between
                gap-4
              "
            >
              <div>
                <div
                  className={`
                    inline-flex rounded-full
                    px-3 py-1 text-xs
                    font-semibold uppercase
                    tracking-[0.2em]
                    ${style.badge}
                  `}
                >
                  {alert.severity}
                </div>

                <h3
                  className={`
                    mt-5 text-2xl
                    font-bold
                    ${style.text}
                  `}
                >
                  {alert.title}
                </h3>

                <p
                  className="
                    mt-4 leading-7
                    text-slate-300
                  "
                >
                  {alert.description}
                </p>
              </div>

              <div
                className={`
                  h-3 w-3 rounded-full
                  ${
                    alert.severity ===
                    "critical"
                      ? "bg-red-400"

                      : alert.severity ===
                        "warning"
                      ? "bg-yellow-600"

                      : "bg-cyan-400"
                  }
                `}
              />
            </div>

            <div
              className="
                mt-8 flex items-center
                justify-between
              "
            >
              <p
                className="
                  text-sm text-muted-foreground
                "
              >
                {alert.time}
              </p>

              <button
                className="
                  rounded-xl
                  bg-white/5 px-4 py-2
                  text-sm transition
                  hover:bg-white/10
                "
              >
                Inspect
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}