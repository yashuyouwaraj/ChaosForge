"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/components/providers/AuthProvider";

export function ProtectedRoute({
  children,
}) {
  const router =
    useRouter();

  const {
    loading,
    isAuthenticated,
  } = useAuth();

  useEffect(() => {
    if (
      !loading &&
      !isAuthenticated
    ) {
      router.push("/login");
    }
  }, [
    loading,
    isAuthenticated,
    router,
  ]);

  if (loading) {
    return (
      <div
        className="
          flex min-h-screen
          items-center
          justify-center
          bg-black text-white
        "
      >
        Initializing
        ChaosForge...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}