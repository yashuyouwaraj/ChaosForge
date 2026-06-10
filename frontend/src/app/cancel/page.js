"use client";

import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-black to-slate-900">
      <div className="w-full max-w-md">
        <div className="glass rounded-[32px] p-12 text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
              <AlertCircle className="w-20 h-20 text-amber-400 relative" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white">Payment Cancelled</h1>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Transaction Not Completed</p>
          </div>

          <div className="space-y-2 text-left bg-amber-500/5 rounded-2xl p-6 border border-amber-500/20">
            <p className="text-sm text-amber-400 font-semibold">Payment was not processed</p>
            <p className="text-sm text-muted-foreground">No charges were made to your account. You can try upgrading to Pro again anytime.</p>
          </div>

          <div className="space-y-2 bg-white/5 rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-muted-foreground">Need help?</p>
            <p className="text-xs text-cyan-300">Contact our support team if you have any issues upgrading.</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 py-3 rounded-lg"
            >
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/billing?from=payment")}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
