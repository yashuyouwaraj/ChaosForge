"use client";

import { Bell } from "lucide-react";

import { Menu } from "lucide-react";

import { usePlatformStatus } from "@/hooks/usePlatformStatus";

const statusStyles = {
  online: "bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]",

  warning: "bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.9)]",

  offline: "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.9)]",
};

function StatusPill({ label, active }) {
  return (
    <div
      className="
        flex items-center
        gap-3 rounded-full
        border border-white/10
        bg-black/20
        px-4 py-2
      "
    >
      <div
        className={`
          h-2.5 w-2.5
          rounded-full
          ${active ? statusStyles.online : statusStyles.offline}
        `}
      />

      <span
        className="
          text-xs font-medium
          uppercase
          tracking-[0.2em]
          text-slate-300
        "
      >
        {label}
      </span>
    </div>
  );
}

export function Navbar({ onOpenSidebar }) {
  const status = usePlatformStatus();

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-white/10
        bg-[#020617]/80
        backdrop-blur-2xl
      "
    >
      <div
        className="
          flex h-20
          items-center
          justify-between
          px-6 lg:px-8
        "
      >
        {/* LEFT */}
        <div
          className="
    flex items-center
    gap-4
  "
        >
          <button
            type="button"
            onClick={onOpenSidebar}
            className="
      flex h-11 w-11
      items-center
      justify-center
      rounded-2xl
      border border-white/10
      bg-black/20
      lg:hidden
    "
          >
            <Menu
              className="
        h-5 w-5
      "
            />
          </button>

          <div>
            <p
              className="
              text-xs uppercase
              tracking-[0.25em]
              text-cyan-400
            "
            >
              ChaosForge Platform
            </p>

            <h2
              className="
              mt-1 text-lg lg:text-2xl
              font-black
            "
            >
              Infrastructure Operations
            </h2>
          </div>
        </div>

        {/* CENTER */}

        <div
          className="
            hidden items-center gap-3 2xl:flex
          "
        >
          <StatusPill label="WebSocket" active={status.websocket} />

          <StatusPill label="Observability" active={status.observability} />

          <StatusPill label="Simulation" active={status.simulation} />
        </div>

        {/* RIGHT */}

        <div
          className="
            flex items-center
            gap-5
          "
        >
          {/* ACTIVE RUN */}

          <div
            className="
              hidden xl:block rounded-2xl
              border border-cyan-400/20
              bg-cyan-400/[0.04]
              px-5 py-3
              lg:block
            "
          >
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.25em]
                text-slate-500
              "
            >
              Active Run
            </p>

            <p
              className="
                mt-1 text-sm
                font-semibold
                text-cyan-300
              "
            >
              {status.simulation && status.runId
                ? `${status.runId.slice(0, 8)}...`
                : "No Active Run"}
            </p>
          </div>

          {/* ALERTS */}

          <button
            className="
              rounded-2xl
              border border-white/10
              bg-black/20 p-3
              transition hover:bg-white/5
            "
          >
            <Bell
              className="
                h-5 w-5
              "
            />
          </button>

          {/* AVATAR */}

          <div
            className="
              flex h-12 w-12
              items-center
              justify-center
              rounded-2xl
              bg-cyan-400/10
              text-lg font-bold
              text-cyan-300
            "
          >
            Y
          </div>
        </div>
      </div>
    </header>
  );
}
