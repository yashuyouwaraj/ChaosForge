"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

const SettingsContext = createContext(null);

const DEFAULT_THEME = "dark";
const DEFAULT_ACCENT = "cyan";

const accentTokens = {
  cyan: {
    rgb: "34 211 238",
    solid: "#06b6d4",
    hover: "#22d3ee",
    text: "#67e8f9",
    lightText: "#0e7490",
    soft: "rgba(6, 182, 212, 0.12)",
    lightSoft: "rgba(6, 182, 212, 0.1)",
    border: "rgba(34, 211, 238, 0.28)",
    lightBorder: "rgba(14, 116, 144, 0.28)",
    glow: "rgba(34, 211, 238, 0.18)",
  },
  purple: {
    rgb: "168 85 247",
    solid: "#a855f7",
    hover: "#c084fc",
    text: "#d8b4fe",
    lightText: "#7e22ce",
    soft: "rgba(168, 85, 247, 0.12)",
    lightSoft: "rgba(168, 85, 247, 0.1)",
    border: "rgba(168, 85, 247, 0.28)",
    lightBorder: "rgba(126, 34, 206, 0.26)",
    glow: "rgba(168, 85, 247, 0.18)",
  },
  green: {
    rgb: "34 197 94",
    solid: "#22c55e",
    hover: "#4ade80",
    text: "#86efac",
    lightText: "#15803d",
    soft: "rgba(34, 197, 94, 0.12)",
    lightSoft: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.28)",
    lightBorder: "rgba(21, 128, 61, 0.28)",
    glow: "rgba(34, 197, 94, 0.18)",
  },
  orange: {
    rgb: "249 115 22",
    solid: "#f97316",
    hover: "#fb923c",
    text: "#fdba74",
    lightText: "#c2410c",
    soft: "rgba(249, 115, 22, 0.12)",
    lightSoft: "rgba(249, 115, 22, 0.1)",
    border: "rgba(249, 115, 22, 0.28)",
    lightBorder: "rgba(194, 65, 12, 0.28)",
    glow: "rgba(249, 115, 22, 0.18)",
  },
  red: {
    rgb: "239 68 68",
    solid: "#ef4444",
    hover: "#f87171",
    text: "#fca5a5",
    lightText: "#b91c1c",
    soft: "rgba(239, 68, 68, 0.12)",
    lightSoft: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.28)",
    lightBorder: "rgba(185, 28, 28, 0.28)",
    glow: "rgba(239, 68, 68, 0.18)",
  },
};

const applyAppearance = (appearance = {}) => {
  if (typeof document === "undefined") {
    return;
  }

  const theme = appearance.theme === "light" ? "light" : DEFAULT_THEME;
  const accentName = accentTokens[appearance.accentColor]
    ? appearance.accentColor
    : DEFAULT_ACCENT;
  const accent = accentTokens[accentName];
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");

  root.style.setProperty("--accent-rgb", accent.rgb);
  root.style.setProperty("--accent", accent.solid);
  root.style.setProperty("--accent-hover", accent.hover);
  root.style.setProperty(
    "--accent-text",
    theme === "light" ? accent.lightText : accent.text,
  );
  root.style.setProperty(
    "--accent-soft",
    theme === "light" ? accent.lightSoft : accent.soft,
  );
  root.style.setProperty(
    "--accent-border",
    theme === "light" ? accent.lightBorder : accent.border,
  );
  root.style.setProperty("--accent-glow", accent.glow);

  localStorage.setItem("chaosforge-theme", theme);
  localStorage.setItem("chaosforge-accent", accentName);
};

const mergeSettings = (currentSettings, updates) => {
  if (!currentSettings) {
    return null;
  }

  return {
    ...currentSettings,
    ...updates,
    appearance: {
      ...(currentSettings.appearance || {}),
      ...(updates.appearance || {}),
    },
    simulationDefaults: {
      ...(currentSettings.simulationDefaults || {}),
      ...(updates.simulationDefaults || {}),
    },
    notifications: {
      ...(currentSettings.notifications || {}),
      ...(updates.notifications || {}),
    },
  };
};

export function SettingsProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const storedTheme =
      typeof window !== "undefined"
        ? localStorage.getItem("chaosforge-theme")
        : DEFAULT_THEME;
    const storedAccent =
      typeof window !== "undefined"
        ? localStorage.getItem("chaosforge-accent")
        : DEFAULT_ACCENT;

    applyAppearance({
      theme: storedTheme || DEFAULT_THEME,
      accentColor: storedAccent || DEFAULT_ACCENT,
    });
  }, []);

  const refreshSettings = useCallback(async () => {
    if (authLoading) {
      return null;
    }

    if (!isAuthenticated) {
      setSettings(null);
      setLoading(false);
      setError("");
      applyAppearance({ theme: DEFAULT_THEME, accentColor: DEFAULT_ACCENT });
      return null;
    }

    try {
      setLoading(true);
      setError("");

      const data = await api("/settings");

      setSettings(data);
      setDirty(false);
      applyAppearance(data?.appearance);
      return data;
    } catch (err) {
      setError(err.message || "Unable to load settings.");
      applyAppearance({ theme: DEFAULT_THEME, accentColor: DEFAULT_ACCENT });
      return null;
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = useCallback(
    async (updates, options = {}) => {
      const previousSettings = settings;

      try {
        setError("");
        setDirty(true);

        const optimistic = mergeSettings(settings, updates);

        if (optimistic) {
          setSettings(optimistic);
        }

        if (optimistic?.appearance) {
          applyAppearance(optimistic.appearance);
        }

        const updated = await api("/settings", "PATCH", updates);

        setSettings(updated);
        setDirty(false);
        setSaved(true);
        applyAppearance(updated?.appearance);

        if (options.toast !== false) {
          toast.success("Settings saved.");
        }

        window.setTimeout(() => setSaved(false), 2000);
        return updated;
      } catch (err) {
        if (previousSettings) {
          setSettings(previousSettings);
          applyAppearance(previousSettings.appearance);
        }

        toast.error("Something went wrong", err.message || "Please try again.");
        throw err;
      }
    },
    [settings],
  );

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      loading,
      error,
      saved,
      dirty,
      refreshSettings,
      reload: refreshSettings,
      updateSettings,
    }),
    [settings, loading, error, saved, dirty, refreshSettings, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettingsContext must be used inside SettingsProvider");
  }

  return context;
}
