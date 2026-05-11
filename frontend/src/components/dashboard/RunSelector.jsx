"use client";

import { useRun } from "@/components/providers/RunProvider";

const mockRuns = [
  {
    projectId: "demo-project",

    runId: "demo-run",
  },

  {
    projectId: "chaos-prod",

    runId: "run-2048",
  },

  {
    projectId: "infra-lab",

    runId: "run-4096",
  },
];

export function RunSelector() {
  const { selectedRun, setSelectedRun } = useRun();

  return (
    <div
      className="
        glass rounded-2xl
        p-4
      "
    >
      <div
        className="
          flex items-center
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
            Active Run
          </p>

          <h3
            className="
              mt-2 text-xl
              font-bold
            "
          >
            {selectedRun.runId}
          </h3>
        </div>

        <select
          value={selectedRun.runId}
          onChange={(e) => {
            const run = mockRuns.find((r) => r.runId === e.target.value);

            if (run) {
              setSelectedRun(run);
            }
          }}
          className="
            rounded-xl border
            border-white/10
            bg-black/30
            px-4 py-3
            outline-none
          "
        >
          {mockRuns.map((run) => (
            <option key={run.runId} value={run.runId}>
              {run.projectId}
              {" / "}
              {run.runId}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
