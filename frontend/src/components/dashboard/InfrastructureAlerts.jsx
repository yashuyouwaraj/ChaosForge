"use client";

import {
  useInfrastructureAlerts,
} from "@/hooks/useInfrastructureAlerts";

const severityStyles = {
  critical:
    "border-red-500/40 bg-red-500/10 text-red-300",

  warning:
    "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",

  info:
    "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
};

export function InfrastructureAlerts() {
  const alerts =
    useInfrastructureAlerts();

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
          Live Incident Feed
        </h3>

        <p
          className="
            mt-3 text-muted-foreground
          "
        >
          Realtime infrastructure
          incident detection stream.
        </p>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div
            className="
              rounded-2xl border
              border-green-500/20
              bg-green-500/5
              p-5 text-green-300
            "
          >
            No active incidents.
          </div>
        ) : (
          alerts.map(
            (
              alert,
              index,
            ) => (
              <div
                key={index}
                className={`
                  rounded-2xl border
                  p-5
                  ${severityStyles[
                    alert.severity
                  ]}
                `}
              >
                <div
                  className="
                    flex items-center
                    justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs uppercase
                        tracking-[0.25em]
                      "
                    >
                      {
                        alert.severity
                      }
                    </p>

                    <h4
                      className="
                        mt-2 text-lg
                        font-bold
                      "
                    >
                      {
                        alert.message
                      }
                    </h4>
                  </div>

                  <div
                    className="
                      h-3 w-3 rounded-full
                      bg-current
                    "
                  />
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}