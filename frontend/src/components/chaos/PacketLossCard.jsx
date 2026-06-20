"use client";

export function PacketLossCard({ chaos, setChaos }) {
  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="text-xl font-bold">Packet Loss</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Randomly drop outgoing requests before they reach the target.
      </p>

      <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <span>Enable Packet Loss</span>
        <input
          type="checkbox"
          aria-label="Enable packet loss"
          className="h-5 w-5 accent-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
          checked={chaos.packetLoss.enabled}
          onChange={(event) =>
            setChaos({
              ...chaos,
              packetLoss: {
                ...chaos.packetLoss,
                enabled: event.target.checked,
              },
            })
          }
        />
      </label>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4 text-sm">
          <label htmlFor="chaos-packet-loss">Packet Loss</label>
          <span className="font-bold">{chaos.packetLoss.percentage}%</span>
        </div>
        <input
          id="chaos-packet-loss"
          type="range"
          min={0}
          max={100}
          value={chaos.packetLoss.percentage}
          onChange={(event) =>
            setChaos({
              ...chaos,
              packetLoss: {
                ...chaos.packetLoss,
                percentage: Number(event.target.value),
              },
            })
          }
          className="mt-3 w-full accent-cyan-400"
        />
      </div>
    </div>
  );
}
