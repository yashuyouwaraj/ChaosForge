"use client";

import { useEffect, useState } from "react";

import { getGrafanaDashboardUrl } from "@/lib/observability";

export function GrafanaPanel({ path = "", title = "Grafana Dashboard" }) {
  const src = getGrafanaDashboardUrl(path);

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
            Observability
          </p>

          <h3
            className="
              mt-2 text-2xl
              font-black
            "
          >
            {title}
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
          {failed ? "Degraded" : "Live"}
        </div>
      </div>

      {/* PANEL */}

      <div
        className="
          relative
          min-h-[700px]
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
                Connecting Grafana
              </h3>

              <p
                className="
                    mt-3 text-sm
                    text-muted-foreground
                  "
              >
                Initializing observability workspace and telemetry systems.
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
                Grafana Unavailable
              </h3>

              <p
                className="
                  mt-4 max-w-xl
                  text-sm leading-7
                  text-slate-400
                "
              >
                The observability workspace is still warming up or temporarily
                unavailable. ChaosForge will automatically retry telemetry
                connectivity.
              </p>
            </div>
          </div>
        )}

        {/* IFRAME */}

        <iframe
          src={src}
          width="100%"
          height="700"
          allowFullScreen
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
