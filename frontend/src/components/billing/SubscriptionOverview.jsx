"use client";

import { Crown, Rocket } from "lucide-react";

import PlanBadge from "./PlanBadge";

export function SubscriptionOverview({ user }) {
  const plan = user?.plan || "free";

  const isPro = plan === "pro";
  const isEnterprise = plan === "enterprise";

  const title = isEnterprise
    ? "ChaosForge Enterprise"
    : isPro
      ? "ChaosForge Pro"
      : "ChaosForge Free";

  const subtitle = isEnterprise
    ? "Enterprise Infrastructure Intelligence Tier"
    : isPro
      ? "Operational Intelligence Tier"
      : "Developer Access Tier";

  const getDaysLeft = () => {
    if (!user?.planExpiresAt) return null;
    const expiryDate = new Date(user.planExpiresAt);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const daysLeft = getDaysLeft();

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
              mt-3 text-6xl
              font-black
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-4 text-lg
              text-muted-foreground
            "
          >
            {subtitle}
          </p>
        </div>

        {isEnterprise ? (
          <Crown
            className="
              h-12 w-12
              text-yellow-400
            "
          />
        ) : isPro ? (
          <Crown
            className="
              h-12 w-12
              text-cyan-400
            "
          />
        ) : (
          <Rocket
            className="
              h-12 w-12
              text-cyan-400
            "
          />
        )}
      </div>

      <div className="mt-8">
        <PlanBadge plan={plan} />
      </div>

      {plan !== "free" && user?.planExpiresAt && (
        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan Expires On</p>
              <p className="mt-2 text-xl font-bold text-white">
                {new Date(user.planExpiresAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-cyan-400 font-semibold">Days Left</p>
              <p className="mt-2 text-3xl font-black text-cyan-400">
                {daysLeft === 0 ? "Expired" : daysLeft}
              </p>
            </div>
          </div>
        </div>
      )}

      <p
        className="
          mt-6 max-w-3xl
          text-muted-foreground
          leading-7
        "
      >
        Your active subscription determines simulation limits,
        infrastructure intelligence access, operational analytics,
        AI-driven insights, reporting capabilities, and future
        enterprise platform features across ChaosForge workloads.
      </p>
    </div>
  );
}