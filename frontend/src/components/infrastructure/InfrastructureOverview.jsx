"use client";

import { Server, Activity, Cpu, Database } from "lucide-react";
import { usePlatform } from "@/components/providers/PlatformProvider";

export function InfrastructureOverview() {
  const { infrastructure } = usePlatform();

  const summary = infrastructure?.infrastructureSummary;

  const cards = [
    {
      label: "Services",
      value: 5,
      icon: Server,
    },
    {
      label: "Workers",
      value: summary?.workers || 0,
      icon: Cpu,
    },
    {
      label: "WebSockets",
      value: summary?.websocketClients || 0,
      icon: Activity,
    },
    {
      label: "Dependencies",
      value: 4,
      icon: Database,
    },
  ];

  return (
    <div className="glass rounded-[32px] p-8">
      <div>
        <p
          className="
            text-sm uppercase
            tracking-[0.3em]
            text-cyan-400
          "
        >
          Infrastructure Operations
        </p>

        <h2
          className="
            mt-3 text-4xl
            font-black
          "
        >
          Distributed Infrastructure Center
        </h2>

        <p
          className="
            mt-4 text-muted-foreground
          "
        >
          Realtime visibility into platform health, dependencies, distributed
          workers, observability services, and system readiness.
        </p>
      </div>

      <div
        className="
          mt-10 grid gap-6
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="
                rounded-[24px]
                border border-white/10
                bg-black/20
                p-6
              "
            >
              <Icon
                className="
                  h-7 w-7
                  text-cyan-400
                "
              />

              <h3
                className="
                  mt-5 text-4xl
                  font-black
                "
              >
                {card.value}
              </h3>

              <p
                className="
                  mt-2 text-muted-foreground
                "
              >
                {card.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
