"use client";

import { createContext, useContext } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useInfrastructureHealth } from "@/hooks/useInfrastructureHealth";
import { useIncidentTimeline } from "@/hooks/useIncidentTimeline";


const PlatformContext = createContext(null);

export function PlatformProvider({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const enabled = !loading && isAuthenticated;
  const infrastructure = useInfrastructureHealth({ enabled });
  const incidents = useIncidentTimeline({ enabled });

  return (
    <PlatformContext.Provider value={{ infrastructure, incidents }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  return useContext(PlatformContext);
}
