"use client";

import { createContext, useContext } from "react";

import { useInfrastructureHealth } from "@/hooks/useInfrastructureHealth";
import { useIncidentTimeline } from "@/hooks/useIncidentTimeline";


const PlatformContext = createContext(null);

export function PlatformProvider({ children }) {
  const infrastructure = useInfrastructureHealth();
  const incidents = useIncidentTimeline();

  return (
    <PlatformContext.Provider value={{ infrastructure, incidents }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  return useContext(PlatformContext);
}
