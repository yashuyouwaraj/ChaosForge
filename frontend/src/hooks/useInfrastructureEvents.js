"use client";

import { useMemo } from "react";

export function useInfrastructureEvents() {
  return useMemo(
    () => [
      {
        type: "INFO",
        title: "Infrastructure Stable",
      },
    ],
    [],
  );
}
