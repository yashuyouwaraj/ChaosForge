"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { api } from "@/lib/api";

export function useSubscriptionCenter() {
  const [user, setUser] = useState(null);

  const [usage, setUsage] = useState(null);

  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const fromPayment = searchParams?.get("from") === "payment";

  const load = useCallback(async () => {
    try {
      const [userData, usageData, paymentHistory] = await Promise.all([
        api("/auth/me"),
        api("/usage/me"),
        api("/payment/history"),
      ]);

      setUser(userData);
      setUsage(usageData);
      setPayments(paymentHistory || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!ignore) {
        await load();
      }
    };

    loadData();

    // If coming from payment page, poll for updates every 2 seconds for 30 seconds
    if (fromPayment) {
      let pollCount = 0;
      const interval = setInterval(async () => {
        if (!ignore && pollCount < 15) {
          await load();
          pollCount++;
        } else {
          clearInterval(interval);
        }
      }, 2000);

      return () => {
        ignore = true;
        clearInterval(interval);
      };
    }

    return () => {
      ignore = true;
    };
  }, [load, fromPayment]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);

  return {
    user,
    usage,
    payments,
    loading,
    refetch,
  };
}
