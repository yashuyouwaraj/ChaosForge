"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [confirming, setConfirming] = useState(true);
  const [plan, setPlan] = useState("pro");
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) {
        setConfirming(false);
        return;
      }

      try {
        const result = await api(`/payment/confirm?session_id=${sessionId}`);
        setPlan(result.plan || "pro");
        setExpiresAt(result.planExpiresAt);
      } catch (err) {
        console.error("Payment confirmation failed:", err);
      } finally {
        setConfirming(false);
      }
    };

    confirmPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-black to-slate-900">
      <div className="w-full max-w-md">
        <div className="glass rounded-[32px] p-12 text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
              <CheckCircle2 className="w-20 h-20 text-green-400 relative" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white">Payment Successful!</h1>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Activated</p>
          </div>

          <div className="space-y-2 bg-white/5 rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-muted-foreground">Session ID</p>
            <p className="text-xs font-mono text-cyan-300 break-all">{sessionId || "N/A"}</p>
          </div>

          {expiresAt && (
            <div className="space-y-2 bg-cyan-500/5 rounded-2xl p-6 border border-cyan-500/20">
              <p className="text-sm text-cyan-400 font-semibold">Subscription Expires</p>
              <p className="text-lg font-black text-white">{new Date(expiresAt).toLocaleDateString()}</p>
            </div>
          )}

          <div className="space-y-2 text-left bg-green-500/5 rounded-2xl p-6 border border-green-500/20">
            <p className="text-sm text-green-400 font-semibold">✓ Your upgrade is complete</p>
            {confirming ? (
              <p className="text-sm text-muted-foreground">Processing your plan activation...</p>
            ) : (
              <p className="text-sm text-muted-foreground">You now have access to all {plan.charAt(0).toUpperCase() + plan.slice(1)} features. Your plan has been updated in your account.</p>
            )}
          </div>

          <Button
            onClick={() => router.push("/billing?from=payment")}
            disabled={confirming}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
          >
            {confirming ? "Processing..." : "Go to Billing"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-black to-slate-900"><div className="glass rounded-[32px] p-12 text-center">Loading...</div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
