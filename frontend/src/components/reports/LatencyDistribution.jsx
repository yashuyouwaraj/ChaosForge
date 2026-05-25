"use client";

import {
  useEffect,
  useState,
} from "react";

import { loadRunDetails } from "./reportData";

const styles = {
  healthy:
    "border-green-500/20 bg-green-500/5 text-green-300",

  moderate:
    "border-cyan-500/20 bg-cyan-500/5 text-cyan-300",

  warning:
    "border-yellow-500/20 bg-yellow-500/5 text-yellow-300",

  critical:
    "border-red-500/20 bg-red-500/5 text-red-300",
};

export function LatencyDistribution({
  run: providedRun,
  runId,
}) {
  const [loadedRun, setLoadedRun] =
    useState(null);
  const run =
    providedRun || loadedRun;

  useEffect(() => {
    if (providedRun || !runId) {
      return;
    }

    let ignore = false;

    const load =
      async () => {
        try {
          const data =
            await loadRunDetails(runId);

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

  const buckets =
    run.latencyBuckets || {};

  const distribution = [
    {
      label: "0-500ms",

      value:
        buckets["0-500"] || 0,

      style:
        styles.healthy,
    },

    {
      label: "500ms-1s",

      value:
        buckets["500-1000"] ||
        0,

      style:
        styles.moderate,
    },

    {
      label: "1s-2s",

      value:
        buckets["1000-2000"] ||
        0,

      style:
        styles.warning,
    },

    {
      label: "2s+",

      value:
        buckets["2000+"] || 0,

      style:
        styles.critical,
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
          Latency Distribution
        </h3>

        <p
          className="
            mt-3 text-muted-foreground
          "
        >
          Request latency behavior
          across distributed
          infrastructure execution.
        </p>
      </div>

      <div
        className="
          grid gap-5
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        {distribution.map(
          (bucket) => (
            <div
              key={
                bucket.label
              }
              className={`
                rounded-2xl
                border p-6
                ${bucket.style}
              `}
            >
              <p
                className="
                  text-sm
                  uppercase
                  tracking-[0.2em]
                "
              >
                {
                  bucket.label
                }
              </p>

              <h3
                className="
                  mt-4 text-4xl
                  font-black
                "
              >
                {
                  bucket.value
                }
              </h3>

              <p
                className="
                  mt-3 text-sm
                  opacity-70
                "
              >
                Requests observed
                within this latency
                window.
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
