"use client";

import { Palette, Moon, Sun } from "lucide-react";

const themes = [
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
  },
  {
    id: "light",
    label: "Light",
    icon: Sun,
  },
];

const accentColors = ["cyan", "purple", "green", "orange", "red"];

const accentSwatches = {
  cyan: "#06b6d4",
  purple: "#a855f7",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
};

export function AppearanceCard({ settings, updateSettings }) {
  const appearance = settings.appearance || {};

  const handleThemeChange = async (theme) => {
    await updateSettings({
      appearance: {
        ...appearance,
        theme,
      },
    });
  };

  const handleAccentChange = async (accentColor) => {
    await updateSettings({
      appearance: {
        ...appearance,
        accentColor,
      },
    });
  };

  return (
    <div className="glass rounded-[32px] p-8">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <Palette className="h-7 w-7 cf-accent-text" />

        <h2 className="text-3xl font-black">Appearance</h2>
      </div>

      <p className="mt-3 text-muted-foreground">
        Customize how ChaosForge looks.
      </p>

      {/* THEME */}

      <div className="mt-10">
        <h3 className="text-xl font-bold">Theme</h3>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {themes.map((theme) => {
            const Icon = theme.icon;

            const active = appearance.theme === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeChange(theme.id)}
                aria-pressed={active}
                className={`
                  rounded-2xl
                  border
                  p-6
                  transition
                  hover:scale-[1.02]
                  focus:outline-none
                  cf-accent-ring

                  ${
                    active
                      ? "cf-accent-border cf-accent-soft cf-accent-glow"
                      : "border-white/10 bg-black/20"
                  }
                `}
              >
                <Icon className="h-8 w-8 cf-accent-text" />

                <h4 className="mt-5 text-xl font-bold">{theme.label}</h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACCENT */}

      <div className="mt-12">
        <h3 className="text-xl font-bold">Accent Color</h3>

        <div className="mt-5 flex flex-wrap gap-5">
          {accentColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleAccentChange(color)}
              aria-label={`Use ${color} accent color`}
              aria-pressed={appearance.accentColor === color}
              style={{ backgroundColor: accentSwatches[color] }}
              className={`
                h-14
                w-14
                rounded-full
                border-4
                transition
                hover:scale-110
                focus:outline-none
                focus:ring-2
                focus:ring-[var(--accent-glow)]

                ${
                  appearance.accentColor === color
                    ? "border-white"
                    : "border-transparent"
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
