"use client";

import { useCallback, useEffect, useState } from "react";

import { getPrometheusGraphUrl, wakePrometheus } from "@/lib/observability";

const LOAD_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;

export function PrometheusPanel({ path = "/", title = "Prometheus", height = 900 }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const src = getPrometheusGraphUrl(path);

  const retry = useCallback(() => {
    setLoaded(false);
    setFailed(false);
    setRetryCount((count) => count + 1);
    wakePrometheus();
  }, []);

  useEffect(() => {
    wakePrometheus();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loaded) {
        setFailed(true);
      }
    }, LOAD_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [loaded, retryCount]);

  return (
    <div className="glass overflow-hidden rounded-[32px] border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            Metrics Infrastructure
          </p>
          <h3 className="mt-2 text-2xl font-black">{title}</h3>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
            failed
              ? "bg-red-500/10 text-red-400"
              : "bg-green-500/10 text-green-400"
          }`}
        >
          {failed ? "Degraded" : "Active"}
        </div>
      </div>

      <div className="relative bg-black" style={{ minHeight: height }}>
        {!loaded && !failed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-black">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />

            <div className="text-center">
              <h3 className="text-xl font-bold">Connecting Prometheus</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Initializing metrics infrastructure and telemetry targets.
              </p>
            </div>
          </div>
        )}

        {failed && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
              <h3 className="text-2xl font-bold text-red-300">
                Prometheus Unavailable
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Metrics infrastructure is still warming up or temporarily
                unavailable. Start the Prometheus container and retry connectivity.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {retryCount < MAX_RETRIES && (
                  <button
                    type="button"
                    onClick={retry}
                    className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    Retry connection
                  </button>
                )}

                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  Open Prometheus
                </a>
              </div>
            </div>
          </div>
        )}

        <iframe
          key={`prometheus-${retryCount}`}
          title={title}
          src={src}
          width="100%"
          height={height}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
          className={`bg-black transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => {
            setLoaded(true);
            setFailed(false);
          }}
        />
      </div>
    </div>
  );
}
