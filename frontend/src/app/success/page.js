"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";

function SuccessContent() {
  const [status, setStatus] = useState("Payment successful!");
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      setStatus(`Payment successful! Session ID: ${sessionId}`);
    } else {
      setStatus("Payment successful!");
    }
  }, [searchParams]);

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Payment Success</h1>
      <p className="text-green-300">{status}</p>
      <p className="mt-4">You can now return to the app and continue using ChaosForge Pro.</p>
      <button
        onClick={() => window.location.href = "/"}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Go to App
      </button>
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
