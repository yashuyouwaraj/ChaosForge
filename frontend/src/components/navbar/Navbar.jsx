"use client";

import { Bell } from "lucide-react";

export function Navbar() {
  return (
    <header
      className="
        sticky top-0 z-50 flex h-16
        items-center justify-between
        border-b bg-background/80 px-6
        backdrop-blur
      "
    >
      <div>
        <h2 className="text-lg font-semibold">
          ChaosForge
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="
            rounded-full p-2
            hover:bg-accent
          "
        >
          <Bell className="h-5 w-5" />
        </button>

        <div
          className="
            flex h-10 w-10 items-center
            justify-center rounded-full
            bg-primary text-primary-foreground
          "
        >
          Y
        </div>
      </div>
    </header>
  );
}