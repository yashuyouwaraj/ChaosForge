"use client";

const cards = [
  {
    label: "AI Models",
    value: "6",
  },
  {
    label: "Insights Generated",
    value: "124",
  },
  {
    label: "Anomalies Detected",
    value: "18",
  },
  {
    label: "Runbooks Generated",
    value: "42",
  },
];

export function AiStatusGrid({ findings = [], incidents = [] }) {
  const cards = [
    {
      label: "AI Models",
      value: 4,
    },

    {
      label: "Insights Generated",
      value: findings.length,
    },

    {
      label: "Anomalies Detected",
      value: incidents.length,
    },

    {
      label: "Runbooks Generated",
      value: findings.filter(
        (f) => f.title.includes("Failure") || f.title.includes("Latency"),
      ).length,
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
              mt-3 text-4xl
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
