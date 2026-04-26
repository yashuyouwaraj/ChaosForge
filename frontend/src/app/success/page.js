"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";

function SuccessContent() {
  const [status, setStatus] = useState("Confirming payment...");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    const confirm = async () => {
      if (!sessionId) {
        setError("No session ID received from Stripe.");
        setStatus("");
        return;
      }

      try {
        const data = await api(`/payment/confirm?session_id=${encodeURIComponent(sessionId)}`);
        setStatus(data.message || "Payment confirmed.");
      } catch (err) {
        setError(err.message || "Failed to confirm payment.");
        setStatus("");
      }
    };

    confirm();
  }, [searchParams]);

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Payment Success</h1>
      {status ? <p className="text-green-300">{status}</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}
      <p className="mt-4">You can now return to the app and continue using ChaosForge.</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
