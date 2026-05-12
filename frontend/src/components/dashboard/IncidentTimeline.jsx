"use client";

import {
  useIncidentTimeline,
} from "@/hooks/useIncidentTimeline";

const severityStyles = {
  critical:
    "border-red-500/30",

  warning:
    "border-yellow-500/30",

  info:
    "border-cyan-500/30",
};

export function IncidentTimeline() {
  const timeline =
    useIncidentTimeline();

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
      <div className="mb-8">
        <h3
          className="
            text-3xl font-black
          "
        >
          Incident Timeline
        </h3>

        <p
          className="
            mt-3 text-muted-foreground
          "
        >
          Historical operational
          infrastructure events.
        </p>
      </div>

      <div className="space-y-4">
        {timeline.length === 0 ? (
          <div
            className="
              text-muted-foreground
            "
          >
            No incidents recorded.
          </div>
        ) : (
          timeline.map(
            (
              incident,
              index,
            ) => (
              <div
                key={index}
                className={`
                  rounded-2xl border
                  p-5
                  ${severityStyles[
                    incident.severity
                  ]}
                `}
              >
                <div
                  className="
                    flex items-start
                    justify-between gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs uppercase
                        tracking-[0.2em]
                        text-muted-foreground
                      "
                    >
                      {
                        incident.severity
                      }
                    </p>

                    <h4
                      className="
                        mt-2 text-lg
                        font-bold
                      "
                    >
                      {
                        incident.message
                      }
                    </h4>
                  </div>

                  <div
                    className="
                      text-sm
                      text-muted-foreground
                    "
                  >
                    {new Date(
                      incident.timestamp,
                    ).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}