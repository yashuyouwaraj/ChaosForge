"use client";

export function DashboardSection({
  title,
  description,
  children,
}) {
  return (
    <section
      className="
        space-y-5
      "
    >
      {(title ||
        description) && (
        <div>
          {title && (
            <h2
              className="
                text-2xl font-black
                lg:text-3xl
              "
            >
              {title}
            </h2>
          )}

          {description && (
            <p
              className="
                mt-2 max-w-3xl
                text-sm leading-7
                text-muted-foreground
                lg:text-base
              "
            >
              {description}
            </p>
          )}
        </div>
      )}

      <div className="min-w-0">
        {children}
      </div>
    </section>
  );
}