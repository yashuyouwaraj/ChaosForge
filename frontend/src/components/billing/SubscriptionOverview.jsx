"use client";

import { Crown, Rocket } from "lucide-react";

import PlanBadge from "./PlanBadge";

export function SubscriptionOverview({ user }) {
  const isPro = user?.plan === "pro";

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
      <div
        className="
          flex items-start
          justify-between
        "
      >
        <div>
          <p
            className="
              text-sm uppercase
              tracking-[0.3em]
              text-cyan-400
            "
          >
            Subscription
          </p>

          <h2
            className="
              mt-3 text-5xl
              font-black
            "
          >
            Current Plan
          </h2>
        </div>

        {isPro ? (
          <Crown
            className="
              h-10 w-10
              text-yellow-400
            "
          />
        ) : (
          <Rocket
            className="
              h-10 w-10
              text-cyan-400
            "
          />
        )}
      </div>

      <div className="mt-8">
        <PlanBadge plan={user?.plan || "free"} />
      </div>

      <p
        className="
          mt-6 max-w-2xl
          text-muted-foreground
        "
      >
        Your active subscription determines simulation limits, infrastructure
        intelligence access, advanced analytics and future enterprise
        capabilities.
      </p>
    </div>
  );
}
