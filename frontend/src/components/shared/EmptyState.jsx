export function EmptyState({
  title,
  description,
  className = "",
  children,
}) {
  return (
    <div
      className={`
        glass rounded-[28px]
        border border-white/10
        p-10 text-center
        ${className}
      `}
    >
      <h3
        className="
          text-2xl font-bold
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-3 text-muted-foreground
        "
      >
        {description}
      </p>

      {children ? (
        <div className="mt-6">
          {children}
        </div>
      ) : null}
    </div>
  );
}
