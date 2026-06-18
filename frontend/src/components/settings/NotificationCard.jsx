"use client";

import { Bell } from "lucide-react";

export function NotificationCard({ settings, updateSettings }) {
  const notifications = settings.notifications || {};

  const toggle = async (field) => {
    await updateSettings({
      notifications: {
        ...notifications,
        [field]: !notifications[field],
      },
    });
  };

  return (
    <div className="glass rounded-[32px] p-8">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <Bell className="h-7 w-7 cf-accent-text" />

        <h2 className="text-3xl font-black">Notifications</h2>
      </div>

      <p className="mt-3 text-muted-foreground">
        Choose which notifications ChaosForge should send.
      </p>

      <div className="mt-10 space-y-5">
        <Toggle
          title="Email Notifications"
          description="Receive important updates by email."
          enabled={notifications.email}
          onToggle={() => toggle("email")}
        />

        <Toggle
          title="Simulation Completed"
          description="Notify when simulations finish."
          enabled={notifications.simulationCompleted}
          onToggle={() => toggle("simulationCompleted")}
        />

        <Toggle
          title="Weekly Reports"
          description="Receive weekly performance summaries."
          enabled={notifications.weeklyReport}
          onToggle={() => toggle("weeklyReport")}
        />
      </div>
    </div>
  );
}

function Toggle({ title, description, enabled, onToggle }) {
  return (
    <div
      className="
        flex items-center
        justify-between
        rounded-2xl
        border border-white/10
        bg-black/20
        p-5
      "
    >
      <div>
        <h3 className="text-lg font-bold">{title}</h3>

        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <button
        onClick={onToggle}
        type="button"
        aria-pressed={enabled}
        className={`
          relative h-8 w-16
          rounded-full
          transition

          ${enabled ? "cf-accent-bg" : "bg-slate-600"}
        `}
      >
        <span
          className={`
            absolute top-1
            h-6 w-6
            rounded-full
            bg-white
            transition

            ${enabled ? "left-9" : "left-1"}
          `}
        />
      </button>
    </div>
  );
}
