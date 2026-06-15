export function InfraStatusCard({ title, status, value, description }) {
  const statusColor =
    status === "healthy"
      ? "bg-green-500"
      : status === "warning"
        ? "bg-amber-400"
        : "bg-red-500";

  return (
    <div
      className="
        glass card-hover
        rounded-[28px]
        p-6
      "
    >
      <div
        className="
          flex items-center
          justify-between
        "
      >
        <h3
          className="
            text-sm
            text-muted-foreground
          "
        >
          {title}
        </h3>

        <div
          className={`
            h-3 w-3 rounded-full
            ${statusColor}
          `}
        />
      </div>

      <p
        className="
          mt-4 text-3xl
          font-black
        "
      >
        {value}
      </p>

      <p
        className="
          mt-3 text-sm
          text-muted-foreground
        "
      >
        {description}
      </p>
    </div>
  );
}
