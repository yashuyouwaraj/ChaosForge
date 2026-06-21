"use client";

import { motion } from "framer-motion";
import { usePlatform } from "@/components/providers/PlatformProvider";
import { useProject } from "@/components/providers/ProjectProvider";
import { AiExplainButton } from "@/components/copilot/AiExplainPanel";

const styles = {
  critical: {
    border: "border-red-500/20",

    bg: "bg-red-500/5",

    text: "text-red-300",

    badge: "bg-red-500/10 text-red-300",

    dot: "bg-red-400",
  },

  warning: {
    border: "border-yellow-500/20",

    bg: "bg-yellow-500/5",

    text: "text-yellow-400",

    badge: "bg-yellow-500/10 text-yellow-400",

    dot: "bg-yellow-500",
  },

  info: {
    border: "border-cyan-500/20",

    bg: "bg-cyan-500/5",

    text: "text-cyan-300",

    badge: "bg-cyan-500/10 text-cyan-300",

    dot: "bg-cyan-400",
  },
};

export function IncidentTimeline() {
  const { incidents: timeline } = usePlatform();
  const { projectId } = useProject() || {};
  const activeRunId =
    timeline.find((incident) => incident?.metadata?.runId)?.metadata?.runId ||
    null;

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
          Operational Event Stream
        </h3>

        <p
          className="
            mt-3 text-muted-foreground
          "
        >
         Realtime distributed infrastructure activity and operational intelligence.
        </p>

        {projectId && activeRunId && (
          <div className="mt-5">
            <AiExplainButton
              label="✨ Investigate with AI"
              title="Incident Investigation"
              skill="incidentInvestigator"
              payload={{
                projectId,
                runId: activeRunId,
              }}
            />
          </div>
        )}
      </div>

      {/* EMPTY */}

      {timeline.length === 0 && (
        <div
          className="
            glass rounded-[28px]
            border border-white/10
            p-10 text-center
          "
        >
          <h3
            className="
              text-2xl font-bold
            "
          >
            Timeline Stable
          </h3>

          <p
            className="
              mt-3 text-muted-foreground
            "
          >
            No operational incidents recorded yet.
          </p>
        </div>
      )}

      {/* TIMELINE */}

      <div className="space-y-6">
        {timeline.map((incident, index) => {
          const style = styles[incident.severity];

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
                delay: index * 0.05,
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
                {/* LEFT */}

                <div>
                  {/* BADGES */}

                  <div
                    className="
                        flex flex-wrap
                        items-center gap-3
                      "
                  >
                    <div
                      className={`
                          inline-flex
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

                  {/* TITLE */}

                  <h3
                    className={`
                        mt-5 text-2xl
                        font-bold
                        ${style.text}
                      `}
                  >
                    {incident.title}
                  </h3>

                  {/* MESSAGE */}

                  <p
                    className="
                        mt-4 leading-7
                        text-slate-300
                      "
                  >
                    {incident.message}
                  </p>
                </div>

                {/* RIGHT */}

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
