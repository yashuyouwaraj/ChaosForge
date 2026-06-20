"use client";

export function TimeoutCard({ chaos, setChaos }) {
  const updateTimeout = (field, value) => {
    setChaos({
      ...chaos,
      timeout: {
        ...chaos.timeout,
        [field]: value,
      },
    });
  };

  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="text-xl font-bold">Timeout Injection</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Simulate slow services by forcing selected requests to time out.
      </p>

      <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <span>Enable Timeout Injection</span>
        <input
          type="checkbox"
          aria-label="Enable timeout injection"
          className="h-5 w-5 accent-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
          checked={chaos.timeout.enabled}
          onChange={(event) => updateTimeout("enabled", event.target.checked)}
        />
      </label>

      <div className="mt-6">
        <label
          htmlFor="chaos-timeout-duration"
          className="block text-sm font-medium"
        >
          Timeout Duration (ms)
        </label>
        <input
          id="chaos-timeout-duration"
          type="number"
          min={100}
          step={100}
          value={chaos.timeout.duration}
          onChange={(event) =>
            updateTimeout("duration", Number(event.target.value))
          }
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4 text-sm">
          <label htmlFor="chaos-timeout-percentage">
            Injection Probability
          </label>
          <span className="font-bold">{chaos.timeout.percentage}%</span>
        </div>
        <input
          id="chaos-timeout-percentage"
          type="range"
          min={0}
          max={100}
          value={chaos.timeout.percentage}
          onChange={(event) =>
            updateTimeout("percentage", Number(event.target.value))
          }
          className="mt-3 w-full accent-cyan-400"
        />
      </div>
    </div>
  );
}
