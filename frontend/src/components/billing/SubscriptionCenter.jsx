"use client";

import { useSubscriptionCenter } from "@/hooks/useSubscriptionCenter";

import { SubscriptionOverview } from "./SubscriptionOverview";

import { UsageOverview } from "./UsageOverview";

import { UpgradePlanCard } from "./UpgradePlanCard";

import PaymentHistory from "./PaymentHistory";
import { PlanLimitsCard } from "./PlanLimitsCard";
import { SubscriptionHealthCard } from "./SubscriptionHealthCard";
import { FeatureAccessMatrix } from "./FeatureAccessMatrix";
import { PricingCenter } from "./PricingCenter";

export function SubscriptionCenter() {
  const { user, usage, payments, loading } = useSubscriptionCenter();

  if (loading) {
    return (
      <div
        className="
          glass rounded-[32px]
          p-10
        "
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className="
        space-y-8
      "
    >
      <SubscriptionOverview user={user} />

      <PricingCenter currentPlan = {user?.plan} />

      <UsageOverview usage={usage} plan={user?.plan} />

      <PlanLimitsCard plan={user?.plan} />

      <SubscriptionHealthCard user={user} payments={payments} />

      <FeatureAccessMatrix />

      {user?.plan !== "pro" && <UpgradePlanCard />}

      <PaymentHistory />
    </div>
  );
}
