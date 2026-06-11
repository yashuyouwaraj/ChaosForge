"use client";

import { Crown } from "lucide-react";

import { api } from "@/lib/api";

export function UpgradePlanCard() {
  const upgrade = async () => {
    try {
      const result = await api("/payment/checkout", "POST", { plan: "pro" });

      window.location.href = result.url;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="
        glass rounded-[32px]
        border border-cyan-500/20
        bg-cyan-500/5
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
            Upgrade
          </p>

          <h2
            className="
              mt-3 text-4xl
              font-black
            "
          >
            ChaosForge Pro
          </h2>

          <p
            className="
              mt-4 max-w-2xl
              text-muted-foreground
            "
          >
            Unlock higher RPS, longer simulations, premium intelligence,
            advanced analytics and future enterprise capabilities.
          </p>
        </div>

        <Crown
          className="
            h-10 w-10
            text-yellow-400
          "
        />
      </div>

      <button
        onClick={upgrade}
        className="
          mt-8 rounded-2xl
          bg-cyan-500
          px-6 py-4
          font-bold
          text-black
          transition
          hover:scale-[1.02]
        "
      >
        Upgrade To Pro
      </button>
    </div>
  );
}
