"use client";

import { motion } from "framer-motion";

import { useActiveSimulations } from "@/hooks/useActiveSimulations";

export function ActiveSimulations() {
  const runs = useActiveSimulations();

  return (
    <div
      className="
        glass overflow-hidden
        rounded-[28px]
      "
    >
      <div
        className="
          flex items-center
          justify-between
          border-b border-white/5
          px-6 py-5
        "
      >
        <div>
          <h3 className="text-2xl font-bold">Active Simulations</h3>

          <p className="text-muted-foreground">
            Distributed traffic orchestration.
          </p>
        </div>

        <button
          className="
            rounded-xl
            bg-cyan-500 px-5 py-3
            text-sm font-semibold
            text-black transition
            hover:scale-[1.02]
          "
        >
          New Simulation
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="
                border-b border-white/5
                text-left text-sm
                text-muted-foreground
              "
            >
              <th className="px-6 py-4">Run ID</th>

              <th className="px-6 py-4">Status</th>

              <th className="px-6 py-4">RPS</th>

              <th className="px-6 py-4">Latency</th>

              <th className="px-6 py-4">Failures</th>

              <th className="px-6 py-4">Duration</th>
            </tr>
          </thead>

          <tbody>
            {runs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="
                    px-6 py-10
                    text-center
                    text-muted-foreground
                  "
                >
                  No active simulations.
                </td>
              </tr>
            )}

            {runs.map((run, index) => (
              <motion.tr
                key={run.runId}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.04,
                }}
                className="
                  border-b border-white/5
                  transition hover:bg-white/[0.02]
                "
              >
                <td
                  className="
                    px-6 py-5
                    font-semibold
                  "
                >
                  {run.runId}
                </td>

                <td className="px-6 py-5">
                  <div
                    className={`
                      inline-flex items-center
                      gap-2 rounded-full
                      px-3 py-1 text-sm
                      ${
                        run.status === "running"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }
                    `}
                  >
                    <div
                      className={`
                        h-2 w-2 rounded-full
                        ${
                          run.status === "running"
                            ? "bg-green-400"
                            : "bg-yellow-400"
                        }
                      `}
                    />

                    {run.status}
                  </div>
                </td>

                <td className="px-6 py-5">{run.currentRps || 0}</td>

                <td className="px-6 py-5">{run.avgLatency || 0}ms</td>

                <td className="px-6 py-5">{run.failure || 0}</td>

                <td className="px-6 py-5">{run.duration || "-"}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
