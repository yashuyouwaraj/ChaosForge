export function MetricCard({
  label,
  value,
  subtext,
  className = "",
  valueClassName = "",
}) {
  return (
    <div
      className={`
        glass rounded-[28px]
        p-6
        ${className}
      `}
    >
      <p
        className="
          text-sm
          text-muted-foreground
        "
      >
        {label}
      </p>

      <h3
        className={`
          mt-4 text-3xl
          font-black
          ${valueClassName}
        `}
      >
        {value}
      </h3>

      {subtext && (
        <p
          className="
            mt-2 text-sm
            text-muted-foreground
          "
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
