"use client";

import { motion } from "framer-motion";

import { useLiveLogs } from "@/hooks/useLiveLogs";
import {
  useRun,
} from "@/components/providers/RunProvider";

const styles = {
  info: "text-cyan-300 border-cyan-400/20 bg-cyan-400/5",

  success: "text-green-300 border-green-400/20 bg-green-400/5",

  warn: "text-yellow-300 border-yellow-400/20 bg-yellow-400/5",

  error: "text-red-300 border-red-400/20 bg-red-400/5",
};

export function LiveLogStream() {
  const { selectedRun } = useRun();

  const logs = useLiveLogs(selectedRun.projectId, selectedRun.runId);

  return (
    <div
      className="
        glass rounded-[28px]
        p-6
      "
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold">Live Infrastructure Feed</h3>

        <p className="text-muted-foreground">
          Realtime distributed system activity.
        </p>
      </div>

      <div
        className="
          max-h-[500px]
          space-y-4 overflow-y-auto
        "
      >
        {logs.length === 0 && (
          <div
            className="
              rounded-2xl
              border border-white/5
              p-8 text-center
              text-muted-foreground
            "
          >
            Waiting for live logs...
          </div>
        )}

        {logs.map((log, index) => (
          <motion.div
            key={`${log.message}-${index}`}
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: index * 0.03,
            }}
            className={`
              rounded-2xl border
              p-4
              ${styles[log.level] || styles.info}
            `}
          >
            <div
              className="
                flex items-start
                justify-between gap-4
              "
            >
              <div>
                <p className="font-medium">{log.message}</p>

                <p
                  className="
                    mt-2 text-xs
                    uppercase opacity-60
                  "
                >
                  {log.level}
                </p>
              </div>

              <p
                className="
                  whitespace-nowrap
                  text-xs opacity-50
                "
              >
                {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
