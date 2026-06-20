export function ChaosStatusBadge({ enabled, children, className = "" }) {
  return (
    <span
      className={`
        inline-flex items-center gap-2 rounded-full border px-3 py-1
        text-xs font-semibold uppercase tracking-[0.2em]
        ${
          enabled
            ? "border-green-500/20 bg-green-500/10 text-green-300"
            : "border-white/10 bg-white/5 text-slate-400"
        }
        ${className}
      `}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {children || (enabled ? "Enabled" : "Disabled")}
    </span>
  );
}
