"use client";

import { motion } from "framer-motion";

import {
  useInfrastructureHealth,
} from "@/hooks/useInfrastructureHealth";

const statusStyles = {
  healthy: "bg-green-500",
  warning: "bg-amber-400",
  critical: "bg-red-500",
};

const getKafkaStatus = (health) => {
  if (!health) {
    return "warning";
  }

  if (health.kafka === "connected") {
    return "healthy";
  }

  if (
    health.kafka === "disabled" ||
    health.kafka === "unknown"
  ) {
    return "warning";
  }

  return "critical";
};

const getNodes = (health) => [
  {
    name: "Frontend",

    status: "healthy",
  },

  {
    name: "API Gateway",

    status:
      health?.status === "ok"
        ? "healthy"
        : "warning",
  },

  {
    name: "Kafka",

    status: getKafkaStatus(health),
  },

  {
    name: "Workers",

    status:
      health?.activeRuns > 0
        ? "healthy"
        : "warning",
  },

  {
    name: "Redis",

    status:
      health?.redis === "connected"
        ? "healthy"
        : "critical",
  },

  {
    name: "WebSockets",

    status:
      health?.websockets
        ?.connectedClients > 0
        ? "healthy"
        : "warning",
  },

  {
    name: "Observability",

    status:
      health?.status === "ok"
        ? "healthy"
        : "warning",
  },
];

export function InfrastructureTopology() {
  const {
    health,
  } =
    useInfrastructureHealth();

  const nodes = getNodes(health);

  return (
    <div
      className="
        glass overflow-hidden
        rounded-[32px]
        p-10
      "
    >
      <div className="mb-12">
        <h3 className="text-3xl font-black">
          Distributed Infrastructure Map
        </h3>

        <p className="mt-3 text-muted-foreground">
          Live topology visualization of the
          ChaosForge distributed system.
        </p>
      </div>

      <div
        className="
          relative flex
          flex-wrap items-center
          justify-center gap-10
        "
      >
        {nodes.map((node, index) => (
          <div
            key={node.name}
            className="
              flex items-center gap-6
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}

              animate={{
                opacity: 1,
                scale: 1,
              }}

              transition={{
                delay: index * 0.08,
              }}

              className="
                relative flex
                h-36 w-36 flex-col
                items-center justify-center
                rounded-[30px]
                border border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
              "
            >
              {/* Glow */}
              <div
                className={`
                  absolute top-5 right-5
                  h-3 w-3 rounded-full
                  ${statusStyles[node.status]}
                `}
              />

              {/* Pulse */}
              <div
                className={`
                  absolute inset-0
                  rounded-[30px]
                  opacity-20 blur-2xl
                  ${statusStyles[node.status]}
                `}
              />

              <div
                className="
                  relative z-10
                  text-center
                "
              >
                <h4
                  className="
                    text-lg font-bold
                  "
                >
                  {node.name}
                </h4>

                <p
                  className="
                    mt-2 text-sm
                    uppercase tracking-[0.2em]
                    text-muted-foreground
                  "
                >
                  {node.status}
                </p>
              </div>
            </motion.div>

            {/* Connection */}
            {index < nodes.length - 1 && (
              <motion.div
                initial={{
                  opacity: 0,
                  scaleX: 0,
                }}

                animate={{
                  opacity: 1,
                  scaleX: 1,
                }}

                transition={{
                  delay: index * 0.1,
                }}

                className="
                  hidden h-[2px]
                  w-20 origin-left
                  bg-gradient-to-r
                  from-cyan-400
                  to-blue-500
                  xl:block
                "
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
