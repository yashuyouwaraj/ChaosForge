export function ExportActions() {
  return (
    <div
      className="
        flex flex-wrap
        gap-3
      "
    >
      <button
        className="
          rounded-2xl
          border border-white/10
          bg-black/20
          px-5 py-3
          text-sm font-semibold
          transition
          hover:bg-white/5
        "
      >
        Export JSON
      </button>

      <button
        className="
          rounded-2xl
          border border-white/10
          bg-black/20
          px-5 py-3
          text-sm font-semibold
          transition
          hover:bg-white/5
        "
      >
        Export CSV
      </button>

      <button
        className="
          rounded-2xl
          bg-cyan-500
          px-5 py-3
          text-sm font-bold
          text-black
          transition
          hover:scale-[1.02]
        "
      >
        Open Report
      </button>
    </div>
  );
}