"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import { api } from "@/lib/api";

const styles = {
  critical: {
    border: "border-red-500/20",

    bg: "bg-red-500/5",

    badge: "bg-red-500/10 text-red-300",

    dot: "bg-red-400",
  },

  warning: {
    border: "border-yellow-500/20",

    bg: "bg-yellow-500/5",

    badge: "bg-yellow-500/10 text-yellow-300",

    dot: "bg-yellow-400",
  },

  info: {
    border: "border-cyan-500/20",

    bg: "bg-cyan-500/5",

    badge: "bg-cyan-500/10 text-cyan-300",

    dot: "bg-cyan-400",
  },
};

export function IncidentReportTimeline({ runId }) {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api(`/incidents/${runId}`);

        setIncidents(data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [runId]);

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
      {/* HEADER */}

      <div className="mb-8">
        <h3
          className="
            text-3xl font-black
          "
        >
          Operational Timeline
        </h3>

        <p
          className="
            mt-3 text-muted-foreground
          "
        >
          Historical infrastructure incidents and operational system events
          during simulation execution.
        </p>
      </div>

      {/* EMPTY */}

      {incidents.length === 0 && (
        <div
          className="
            rounded-2xl
            border border-white/10
            bg-black/20
            p-10 text-center
          "
        >
          <h3
            className="
              text-2xl font-bold
            "
          >
            No Incidents Detected
          </h3>

          <p
            className="
              mt-3 text-muted-foreground
            "
          >
            Infrastructure execution completed without operational incidents.
          </p>
        </div>
      )}

      {/* TIMELINE */}

      <div className="space-y-5">
        {incidents.map((incident, index) => {
          const style = styles[incident.severity] || styles.info;

          return (
            <motion.div
              key={incident.id || index}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.04,
              }}
              className={`
                  rounded-2xl
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
                    className="
                        flex flex-wrap
                        items-center gap-3
                      "
                  >
                    <div
                      className={`
                          rounded-full
                          px-3 py-1
                          text-xs font-semibold
                          uppercase
                          tracking-[0.2em]
                          ${style.badge}
                        `}
                    >
                      {incident.severity}
                    </div>

                    <div
                      className="
                          rounded-full
                          bg-white/5
                          px-3 py-1
                          text-xs uppercase
                          tracking-[0.2em]
                          text-slate-300
                        "
                    >
                      {incident.type}
                    </div>
                  </div>

                  <h3
                    className="
                        mt-5 text-2xl
                        font-bold
                      "
                  >
                    {incident.title}
                  </h3>

                  <p
                    className="
                        mt-4 leading-7
                        text-slate-300
                      "
                  >
                    {incident.message}
                  </p>
                </div>

                <div
                  className="
                      flex flex-col
                      items-end gap-4
                    "
                >
                  <div
                    className={`
                        h-3 w-3
                        rounded-full
                        ${style.dot}
                      `}
                  />

                  <p
                    className="
                        whitespace-nowrap
                        text-sm
                        text-muted-foreground
                      "
                  >
                    {new Date(incident.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
