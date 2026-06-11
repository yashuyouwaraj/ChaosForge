"use client";

export function SubscriptionHealthCard({ user, payments }) {
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
        Subscription Status
      </p>

      <h2
        className="
          mt-3 text-4xl
          font-black
        "
      >
        Active
      </h2>

      <div
        className="
          mt-8 grid gap-5
          md:grid-cols-3
        "
      >
        <Stat label="Plan" value={user?.plan?.toUpperCase()} />

        <Stat label="Payments" value={payments?.length || 0} />

        <Stat 
          label="Status" 
          value="Operational" 
        />
      </div>

      {user?.plan !== "free" && user?.planExpiresAt && (
        <div
          className="
            mt-8 rounded-[24px]
            border border-cyan-500/20
            bg-cyan-500/5
            p-5
          "
        >
          <p className="text-sm text-cyan-400">Subscription Expires</p>
          <h3
            className="
              mt-3 text-xl
              font-black
            "
          >
            {new Date(user.planExpiresAt).toLocaleDateString()}
          </h3>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
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
          mt-3 text-2xl
          font-black
        "
      >
        {value}
      </h3>
    </div>
  );
}
