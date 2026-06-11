"use client";

import { api } from "@/lib/api";

import { PlanComparisonCard } from "./PlanComparisonCard";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,

    features: ["Basic Simulations", "Basic Reports"],
  },

  {
    id: "pro",
    name: "Pro",
    price: 500,

    features: [
      "AI Intelligence",
      "Advanced Reports",
      "Predictive Risk",
      "Infrastructure Memory",
    ],
  },

  {
    id: "enterprise",
    name: "Enterprise",
    price: 2500,

    features: [
      "Unlimited Simulations",
      "Enterprise Analytics",
      "Priority Support",
      "Custom Integrations",
    ],
  },
];

export function PricingCenter({ currentPlan }) {
  const upgrade = async (plan) => {
    try {
      const result = await api("/payment/checkout", "POST", {
        plan,
      });

      window.location.href = result.url;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="
        space-y-8
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
          Subscription Plans
        </p>

        <h2
          className="
            mt-3 text-5xl
            font-black
          "
        >
          Pricing Center
        </h2>
      </div>

      <div
        className="
          grid gap-6
          xl:grid-cols-3
        "
      >
        {plans.map((plan) => (
          <PlanComparisonCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            onUpgrade={upgrade}
          />
        ))}
      </div>
    </div>
  );
}
