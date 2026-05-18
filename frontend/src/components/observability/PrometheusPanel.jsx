"use client";

import { getPrometheusGraphUrl } from "@/lib/observability";

export function PrometheusPanel({
  path = "/targets",
}) {
  const src =
    getPrometheusGraphUrl(path);
    
  return (
    <div
      className="
        glass overflow-hidden
        rounded-[32px]
        border border-white/10
      "
    >
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
          className="
            rounded-full
            bg-green-500/10
            px-4 py-2
            text-xs font-semibold
            uppercase tracking-[0.2em]
            text-green-400
          "
        >
          Active
        </div>
      </div>

      <iframe
        src={src}
        width="100%"
        height="650"
        className="bg-black"
      />
    </div>
  );
}
