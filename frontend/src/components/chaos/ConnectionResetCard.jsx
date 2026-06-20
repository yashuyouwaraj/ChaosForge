"use client";

export function ConnectionResetCard({ chaos, setChaos }) {
  const updateConnectionReset = (field, value) => {
    setChaos({
      ...chaos,
      connectionReset: {
        ...chaos.connectionReset,
        [field]: value,
      },
    });
  };

  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="text-xl font-bold">Connection Reset</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Simulate abrupt TCP connection resets before a response is received.
      </p>

      <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <span>Enable Connection Reset</span>
        <input
          type="checkbox"
          aria-label="Enable connection reset"
          className="h-5 w-5 accent-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
          checked={chaos.connectionReset.enabled}
          onChange={(event) =>
            updateConnectionReset("enabled", event.target.checked)
          }
        />
      </label>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4 text-sm">
          <label htmlFor="chaos-connection-reset-percentage">
            Reset Probability
          </label>
          <span className="font-bold">{chaos.connectionReset.percentage}%</span>
        </div>
        <input
          id="chaos-connection-reset-percentage"
          type="range"
          min={0}
          max={100}
          value={chaos.connectionReset.percentage}
          onChange={(event) =>
            updateConnectionReset("percentage", Number(event.target.value))
          }
          className="mt-3 w-full accent-cyan-400"
        />
      </div>
    </div>
  );
}
