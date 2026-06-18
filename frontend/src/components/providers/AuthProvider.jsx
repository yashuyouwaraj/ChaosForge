"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { clearAuthStorage, getUsableStoredToken } from "@/lib/auth-token";
import { toast } from "@/lib/toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getUsableStoredToken();

    if (!token) {
      queueMicrotask(() => {
        setLoading(false);
      });
      return;
    }

    api("/auth/me")
      .then((profile) => {
        setUser({ token, ...profile });
      })
      .catch(() => {
        clearAuthStorage();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = () => {
    clearAuthStorage();
    toast.queueSuccess("You have been logged out.");
    window.location.href = "/login";
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      logout,
      isAuthenticated: !!user,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
