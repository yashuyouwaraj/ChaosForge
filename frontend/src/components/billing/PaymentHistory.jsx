"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api("/payment/history");

        setPayments(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
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
          Billing
        </p>

        <h2
          className="
            mt-3 text-4xl
            font-black
          "
        >
          Payment History
        </h2>
      </div>

      {payments.length === 0 ? (
        <div
          className="
            mt-8 rounded-[24px]
            border border-white/10
            bg-black/20
            p-8 text-center
          "
        >
          No payments found.
        </div>
      ) : (
        <div
          className="
            mt-8 space-y-4
          "
        >
          {payments.map((payment, index) => (
            <div
              key={payment._id || index}
              className="
                  rounded-[24px]
                  border border-white/10
                  bg-black/20
                  p-6
                "
            >
              <div
                className="
                    flex flex-wrap
                    items-center
                    justify-between
                    gap-4
                  "
              >
                <div>
                  <h3
                    className="
                        text-xl
                        font-bold
                      "
                  >
                    {payment.plan?.toUpperCase()}
                  </h3>

                  <p
                    className="
                        mt-2 text-sm
                        text-muted-foreground
                      "
                  >
                    {new Date(payment.date).toLocaleString()}
                  </p>
                </div>

                <div
                  className="
                      text-right
                    "
                >
                  <h3
                    className="
                        text-2xl
                        font-black
                      "
                  >
                    ₹{payment.amount}
                  </h3>

                  <p
                    className="
                        text-sm
                        text-green-400
                      "
                  >
                    {payment.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
