"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    setUser({ token });

    setLoading(false);
  }, []);

  const logout = () => {
    ocalStorage.removeItem("token");

    localStorage.removeItem("projectId");

    localStorage.removeItem("currentRunId");

    localStorage.removeItem("currentRunActive");

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
