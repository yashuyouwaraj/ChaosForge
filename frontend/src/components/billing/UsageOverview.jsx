"use client";

export function UsageOverview({
  usage,
  plan,
}) {

  const limits = {
    free: {
      projects: 3,
      rps: 100,
      duration: 300,
    },

    pro: {
      projects: 100,
      rps: 10000,
      duration: 3600,
    },

    enterprise: {
      projects: "∞",
      rps: "∞",
      duration: "∞",
    },
  };

  const currentLimits =
    limits[plan] ||
    limits.free;

  const cards = [
    {
      label: "Projects",
      value: `${usage?.projectsCreated || 0} / ${currentLimits.projects}`,
    },

    {
      label: "Peak RPS",
      value: `${usage?.peakRpsUsed || 0} / ${currentLimits.rps}`,
    },

    {
      label: "Duration",
      value: `${usage?.maxDurationUsed || 0}s / ${currentLimits.duration}s`,
    },

    {
      label: "Simulations",
      value: usage?.simulationsExecuted || 0,
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
              mt-4 text-3xl
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