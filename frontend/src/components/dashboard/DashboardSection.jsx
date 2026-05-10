export function DashboardSection({
  title,
  description,
  children,
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">
          {title}
        </h2>

        {description && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}