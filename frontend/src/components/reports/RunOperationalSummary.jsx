export function RunOperationalSummary({
  run,
}) {
  const successRate =
    run.totalRequests > 0
      ? (
          (run.success /
            run.totalRequests) *
          100
        ).toFixed(1)
      : 100;

  const summary = `
Infrastructure sustained
${run.rps || 0} RPS with
average latency of
${run.avgLatency || 0}ms.

Operational success rate
remained at ${successRate}% with
${run.failure || 0} failures
detected during the simulation.

P95 latency reached
${run.p95Latency || 0}ms
under distributed load pressure.
`;

  return (
    <div
      className="
        rounded-[28px]
        border border-cyan-500/20
        bg-cyan-500/5
        p-6
      "
    >
      <div
        className="
          flex items-center
          gap-3
        "
      >
        <div
          className="
            flex h-12 w-12
            items-center
            justify-center
            rounded-2xl
            bg-white/5
            text-xl
          "
        >
          🧠
        </div>

        <div>
          <p
            className="
              text-xs uppercase
              tracking-[0.25em]
              text-cyan-400
            "
          >
            AI Operational Summary
          </p>

          <h4
            className="
              mt-1 text-xl
              font-bold
            "
          >
            Infrastructure Analysis
          </h4>
        </div>
      </div>

      <p
        className="
          mt-6 leading-8
          text-slate-300
        "
      >
        {summary}
      </p>
    </div>
  );
}