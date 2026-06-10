"use client";

import { Check } from "lucide-react";

export function FeatureAccessMatrix() {
  const features = [
    "AI Operational Intelligence",
    "Executive Reports",
    "Predictive Risk Analysis",
    "Root Cause Detection",
    "Infrastructure Memory",
    "Runbook Intelligence",
    "Advanced Simulations",
    "Premium Analytics",
  ];

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
        Access Control
      </p>

      <h2
        className="
          mt-3 text-4xl
          font-black
        "
      >
        Enabled Features
      </h2>

      <div
        className="
          mt-8 grid gap-4
          md:grid-cols-2
        "
      >
        {features.map((feature) => (
          <div
            key={feature}
            className="
                rounded-[24px]
                border border-white/10
                bg-black/20
                p-5
              "
          >
            <div
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

              <span>{feature}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
