"use client";

import { createContext, useContext, useState } from "react";

const RunContext = createContext(null);

export function RunProvider({ children }) {
  const [selectedRun, setSelectedRun] = useState({
    projectId: "demo-project",
    runId: "demo-run",
  });

  return (
    <RunContext.Provider value={{ selectedRun, setSelectedRun }}>
      {children}
    </RunContext.Provider>
  );
}

export function useRun() {
  return useContext(RunContext);
}
