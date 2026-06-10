"use client";

export function UsageOverview({ usage }) {
  const cards = [
    {
      label: "Simulations",
      value: usage?.simulationsExecuted || 0,
    },

    {
      label: "Peak RPS",
      value: usage?.peakRpsUsed || 0,
    },

    {
      label: "Max Duration",
      value: `${usage?.maxDurationUsed || 0}s`,
    },

    {
      label: "Projects",
      value: usage?.projectsCreated || 0,
    },
  ];

  return (
    <div
      className="
        grid gap-6
        md:grid-cols-2
        xl:grid-cols-4
      "
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="
              glass rounded-[28px]
              p-6
            "
        >
          <p
            className="
                text-sm
                text-muted-foreground
              "
          >
            {card.label}
          </p>

          <h3
            className="
                mt-4 text-4xl
                font-black
              "
          >
            {card.value}
          </h3>
        </div>
      ))}
    </div>
  );
}
