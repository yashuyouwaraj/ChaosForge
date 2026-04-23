"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await api("/payment/history");
        setPayments(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load payment history");
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mt-6">
      <h2 className="mb-4 text-lg">Payment History</h2>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {payments.map((p, i) => (
        <div key={i} className="mb-2">
          Rs {p.amount} - {p.plan.toUpperCase()} - {p.status}
        </div>
      ))}
    </div>
  );
}
