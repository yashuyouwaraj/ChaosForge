"use client";

import { Check } from "lucide-react";

export function PlanComparisonCard({ plan, currentPlan, onUpgrade }) {
  const isCurrent = currentPlan === plan.id;

  const planOrder = {
    free: 0,
    pro: 1,
    enterprise: 2,
  };

  const isDowngrade = planOrder[plan.id] < planOrder[currentPlan];

  const isRecommended = plan.id === "pro";

  return (
    <div
      className={`
        glass rounded-[32px]
        p-8 flex flex-col
        transition-all duration-300

        ${
          isRecommended
            ? `
              border
              border-cyan-500/40
              shadow-[0_0_40px_rgba(6,182,212,0.15)]
            `
            : ""
        }
      `}
    >
      {/* MOST POPULAR */}

      {isRecommended && (
        <div
          className="
            mb-5 inline-flex
            w-fit rounded-full
            bg-cyan-500/10
            px-3 py-1
            text-xs font-bold
            uppercase
            tracking-[0.2em]
            text-cyan-300
          "
        >
          Most Popular
        </div>
      )}

      {/* HEADER */}

      <div>
        <p
          className="
            text-sm uppercase
            tracking-[0.3em]
            text-cyan-400
          "
        >
          {plan.name}
        </p>

        <h2
          className="
            mt-4 text-5xl
            font-black
          "
        >
          ₹{plan.price}
        </h2>

        <p
          className="
            mt-2 text-muted-foreground
          "
        >
          per month
        </p>
      </div>

      {/* FEATURES */}

      <div
        className="
          mt-8 flex-1
          space-y-4
        "
      >
        {plan.features.map((feature) => (
          <div
            key={feature}
            className="
                flex items-center
                gap-3
              "
          >
            <Check
              className="
                  h-4 w-4
                  text-green-400
                "
            />

            <span
              className="
                  text-sm
                  text-slate-300
                "
            >
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* ACTION */}

      <button
        disabled={isCurrent || isDowngrade}
        onClick={() => onUpgrade(plan.id)}
        className={`
          mt-8 rounded-2xl
          px-5 py-4
          text-sm font-bold
          transition-all

          ${
            isCurrent
              ? `
                bg-cyan-500/20
                text-cyan-300
                cursor-not-allowed
              `
              : isDowngrade
                ? `
                  bg-white/5
                  text-slate-500
                  cursor-not-allowed
                `
                : `
                  bg-cyan-500
                  text-black
                  hover:scale-[1.02]
                `
          }
        `}
      >
        {isCurrent
          ? "Current Plan"
          : isDowngrade
            ? "Lower Tier"
            : `Upgrade to ${plan.name}`}
      </button>
    </div>
  );
}
