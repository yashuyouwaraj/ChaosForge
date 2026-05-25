"use client";

import { useEffect, useState } from "react";

import { loadRunDetails } from "./reportData";

export function FailureBreakdown({ run: providedRun, runId }) {
  const [loadedRun, setLoadedRun] = useState(null);
  const run = providedRun || loadedRun;

  useEffect(() => {
    if (providedRun || !runId) {
      return;
    }

    let ignore = false;

    const load = async () => {
      try {
        const data = await loadRunDetails(runId);

        if (!ignore) {
          setLoadedRun(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [providedRun, runId]);

  if (!run) {
    return null;
  }

  const errors = run.errorTypes || {};

  const cards = [
    {
      label: "Timeout Errors",

      value: errors.timeout || 0,
    },

    {
      label: "Network Errors",

      value: errors.network || 0,
    },

    {
      label: "Server Errors",

      value: errors.server || 0,
    },
  ];

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
          Failure Analysis
        </h3>

        <p
          className="
            mt-3 text-muted-foreground
          "
        >
          Distributed infrastructure error intelligence.
        </p>
      </div>

      <div
        className="
          grid gap-5
          md:grid-cols-3
        "
      >
        {cards.map((card) => (
          <div
            key={card.label}
            className="
                rounded-2xl
                border border-red-500/20
                bg-red-500/5
                p-6
              "
          >
            <p
              className="
                  text-sm
                  text-red-300
                "
            >
              {card.label}
            </p>

            <h3
              className="
                  mt-4 text-4xl
                  font-black
                "
            >
              {card.value}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
