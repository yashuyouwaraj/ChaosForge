export function AiInsightsPreview() {
  return (
    <div
      className="
        glass rounded-3xl
        border border-cyan-500/20
        p-6
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex h-12 w-12 items-center
            justify-center rounded-2xl
            bg-cyan-500/10
          "
        >
          🧠
        </div>

        <div>
          <h3 className="text-xl font-semibold">
            AI Infrastructure Insight
          </h3>

          <p className="text-muted-foreground">
            Realtime analysis engine
          </p>
        </div>
      </div>

      <div
        className="
          mt-6 rounded-2xl
          border border-white/10
          bg-black/20 p-4
        "
      >
        <p className="text-sm leading-7">
          Elevated latency detected during
          websocket burst traffic.
          Possible bottleneck:
          Redis write pressure.
        </p>
      </div>
    </div>
  );
}