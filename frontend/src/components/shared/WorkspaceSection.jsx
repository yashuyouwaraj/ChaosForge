export function WorkspaceSection({
  eyebrow,
  title,
  description,
  children,
  className = "",
  headerAction,
}) {
  return (
    <div
      className={`
        glass rounded-[32px]
        p-8
        ${className}
      `}
    >
      {(eyebrow || title || description) && (
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {eyebrow && (
              <p
                className="
                  text-sm uppercase
                  tracking-[0.3em]
                  text-cyan-400
                "
              >
                {eyebrow}
              </p>
            )}

            {title && (
              <h2
                className="
                  mt-4 text-4xl
                  font-black
                "
              >
                {title}
              </h2>
            )}

            {description && (
              <p
                className="
                  mt-3 max-w-3xl
                  text-muted-foreground
                "
              >
                {description}
              </p>
            )}
          </div>

          {headerAction}
        </div>
      )}

      {children}
    </div>
  );
}
