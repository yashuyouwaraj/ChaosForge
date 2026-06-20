"use client";

const STATUS_CODES = [429, 500, 502, 503, 504];

export function FailureCard({ chaos, setChaos }) {
  const toggleCode = (code) => {
    const exists = chaos.statusCode.codes.includes(code);

    setChaos({
      ...chaos,
      statusCode: {
        ...chaos.statusCode,
        codes: exists
          ? chaos.statusCode.codes.filter((item) => item !== code)
          : [...chaos.statusCode.codes, code],
      },
    });
  };

  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="text-xl font-bold">Failure Injection</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Return selected HTTP errors for a percentage of simulated requests.
      </p>

      <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <span>Enable HTTP Failures</span>
        <input
          type="checkbox"
          aria-label="Enable HTTP failure injection"
          className="h-5 w-5 accent-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
          checked={chaos.statusCode.enabled}
          onChange={(event) =>
            setChaos({
              ...chaos,
              statusCode: {
                ...chaos.statusCode,
                enabled: event.target.checked,
              },
            })
          }
        />
      </label>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4 text-sm">
          <label htmlFor="chaos-failure-rate">Failure Rate</label>
          <span className="font-bold">{chaos.failureRate}%</span>
        </div>
        <input
          id="chaos-failure-rate"
          type="range"
          min={0}
          max={100}
          value={chaos.failureRate}
          onChange={(event) =>
            setChaos({
              ...chaos,
              failureRate: Number(event.target.value),
            })
          }
          className="mt-3 w-full accent-cyan-400"
        />
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium">Injected Status Codes</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {STATUS_CODES.map((code) => {
            const selected = chaos.statusCode.codes.includes(code);

            return (
              <button
                key={code}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleCode(code)}
                className={`rounded-xl border px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/40 ${
                  selected
                    ? "border-cyan-400/30 bg-cyan-500 text-black"
                    : "border-white/10 bg-black/20 hover:border-cyan-400/30"
                }`}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
