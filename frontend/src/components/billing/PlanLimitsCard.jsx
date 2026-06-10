"use client";

const PLAN_LIMITS = {
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
};

export function PlanLimitsCard({ plan = "free" }) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
      <p
        className="
          text-sm uppercase
          tracking-[0.3em]
          text-cyan-400
        "
      >
        Subscription Limits
      </p>

      <h2
        className="
          mt-3 text-4xl
          font-black
        "
      >
        Plan Capacity
      </h2>

      <div
        className="
          mt-8 grid gap-5
          md:grid-cols-3
        "
      >
        <LimitCard label="Projects" value={limits.projects} />

        <LimitCard label="Max RPS" value={limits.rps} />

        <LimitCard label="Duration" value={`${limits.duration}s`} />
      </div>
    </div>
  );
}

function LimitCard({ label, value }) {
  return (
    <div
      className="
        rounded-[24px]
        border border-white/10
        bg-black/20
        p-5
      "
    >
      <p className="text-sm text-muted-foreground">{label}</p>

      <h3
        className="
          mt-3 text-3xl
          font-black
        "
      >
        {value}
      </h3>
    </div>
  );
}
