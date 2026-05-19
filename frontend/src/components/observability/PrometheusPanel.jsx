"use client";

import { useEffect, useState } from "react";

import { getPrometheusGraphUrl } from "@/lib/observability";

export function PrometheusPanel({ path = "/targets" }) {
  const src = getPrometheusGraphUrl(path);

  const [loaded, setLoaded] = useState(false);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loaded) {
        setFailed(true);
      }
    }, 12000);

    return () => clearTimeout(timeout);
  }, [loaded]);

  return (
    <div
      className="
        glass overflow-hidden
        rounded-[32px]
        border border-white/10
      "
    >
      {/* HEADER */}

      <div
        className="
          flex items-center
          justify-between
          border-b border-white/10
          px-6 py-4
        "
      >
        <div>
          <p
            className="
              text-xs uppercase
              tracking-[0.25em]
              text-cyan-400
            "
          >
            Metrics Infrastructure
          </p>

          <h3
            className="
              mt-2 text-2xl
              font-black
            "
          >
            Prometheus Targets
          </h3>
        </div>

        <div
          className={`
            rounded-full
            px-4 py-2
            text-xs font-semibold
            uppercase tracking-[0.2em]

            ${
              failed
                ? `
                  bg-red-500/10
                  text-red-400
                `
                : `
                  bg-green-500/10
                  text-green-400
                `
            }
          `}
        >
          {failed ? "Degraded" : "Active"}
        </div>
      </div>

      {/* PANEL */}

      <div
        className="
          relative
          min-h-[650px]
          bg-black
        "
      >
        {/* LOADING */}

        {!loaded && !failed && (
          <div
            className="
                absolute inset-0
                z-10 flex flex-col
                items-center
                justify-center
                gap-5
                bg-black
              "
          >
            <div
              className="
                  h-12 w-12
                  animate-spin
                  rounded-full
                  border-2 border-cyan-400/20
                  border-t-cyan-400
                "
            />

            <div className="text-center">
              <h3
                className="
                    text-xl font-bold
                  "
              >
                Connecting Prometheus
              </h3>

              <p
                className="
                    mt-3 text-sm
                    text-muted-foreground
                  "
              >
                Initializing metrics infrastructure and telemetry targets.
              </p>
            </div>
          </div>
        )}

        {/* FAILED */}

        {failed && (
          <div
            className="
              absolute inset-0
              z-20 flex flex-col
              items-center
              justify-center
              px-8 text-center
            "
          >
            <div
              className="
                rounded-2xl
                border border-red-500/20
                bg-red-500/5
                p-8
              "
            >
              <h3
                className="
                  text-2xl font-bold
                  text-red-300
                "
              >
                Prometheus Unavailable
              </h3>

              <p
                className="
                  mt-4 max-w-xl
                  text-sm leading-7
                  text-slate-400
                "
              >
                Metrics infrastructure is still warming up or temporarily
                unavailable. ChaosForge will continue retrying telemetry
                connectivity automatically.
              </p>
            </div>
          </div>
        )}

        {/* IFRAME */}

        <iframe
          src={src}
          width="100%"
          height="650"
          className={`
            bg-black
            transition-opacity
            duration-500

            ${loaded ? "opacity-100" : "opacity-0"}
          `}
          onLoad={() => {
            setLoaded(true);
            setFailed(false);
          }}
        />
      </div>
    </div>
  );
}
