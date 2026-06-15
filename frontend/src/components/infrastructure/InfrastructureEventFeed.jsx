"use client";

import { useInfrastructureEvents } from "@/hooks/useInfrastructureEvents";
import { useMemo } from "react";

export function InfrastructureEventFeed() {
  const events = useInfrastructureEvents();

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
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
          Infrastructure Events
        </p>

        <h2
          className="
            mt-3 text-4xl
            font-black
          "
        >
          Operational Event Stream
        </h2>

        <p
          className="
            mt-4 text-muted-foreground
          "
        >
          Realtime distributed infrastructure activity.
        </p>
      </div>

      <div
        className="
          mt-10 space-y-4
        "
      >
        {events.map((event, index) => (
          <div
            key={index}
            className="
              flex items-center
              justify-between
              rounded-[24px]
              border border-white/10
              bg-black/20
              p-5
            "
          >
            <div>
              <div
                className="
                  flex items-center
                  gap-2
                "
              >
                <span
                  className="
                    rounded-full
                    bg-cyan-500/10
                    px-2 py-1
                    text-[10px]
                    font-bold
                    text-cyan-300
                  "
                >
                  {event.type}
                </span>
              </div>

              <h4
                className="
                  mt-3 text-lg
                  font-bold
                "
              >
                {event.title}
              </h4>
            </div>

            <div
              className="
                text-sm
                text-muted-foreground
              "
            >
              {event.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
