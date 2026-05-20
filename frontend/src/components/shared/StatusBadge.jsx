const styles = {
  healthy:
    "bg-green-500/10 text-green-300 border-green-500/20 shadow-[0_0_18px_rgba(34,197,94,0.12)]",

  running:
    "bg-green-500/10 text-green-300 border-green-500/20 shadow-[0_0_18px_rgba(34,197,94,0.12)]",

  success:
    "bg-green-500/10 text-green-300 border-green-500/20 shadow-[0_0_18px_rgba(34,197,94,0.12)]",

  warning:
    "bg-yellow-500/10 text-yellow-300 border-yellow-500/20 shadow-[0_0_18px_rgba(234,179,8,0.12)]",

  paused:
    "bg-yellow-500/10 text-yellow-300 border-yellow-500/20 shadow-[0_0_18px_rgba(234,179,8,0.12)]",

  critical:
    "bg-red-500/10 text-red-300 border-red-500/20 shadow-[0_0_18px_rgba(239,68,68,0.12)]",

  error:
    "bg-red-500/10 text-red-300 border-red-500/20 shadow-[0_0_18px_rgba(239,68,68,0.12)]",

  stopped:
    "bg-red-500/10 text-red-300 border-red-500/20 shadow-[0_0_18px_rgba(239,68,68,0.12)]",

  info:
    "bg-cyan-500/10 text-cyan-300 border-cyan-500/20 shadow-[0_0_18px_rgba(6,182,212,0.12)]",
};

export function StatusBadge({
  status = "info",
  children,
  className = "",
}) {
  const tone = styles[status] || styles.info;

  return (
    <div
      className={`
        inline-flex items-center
        gap-2 rounded-full
        border px-3 py-1
        text-xs font-semibold
        uppercase tracking-[0.2em]
        ${tone}
        ${className}
      `}
    >
      <div
        className="
          h-2 w-2 rounded-full
          bg-current
        "
      />

      {children || status}
    </div>
  );
}
