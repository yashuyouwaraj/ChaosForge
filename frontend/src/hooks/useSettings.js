"use client";

import { useSettingsContext } from "@/components/providers/SettingsProvider";

export function useSettings() {
  return useSettingsContext();
}
