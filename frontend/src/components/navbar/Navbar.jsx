"use client";

import { Bell, LogOut, Menu } from "lucide-react";

import { usePlatformStatus } from "@/hooks/usePlatformStatus";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar({ onOpenSidebar }) {
  const status = usePlatformStatus();
  const { user, logout, loading } = useAuth();
  const displayName = user?.name || user?.email || "User";
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "U";

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
    hidden items-center
    gap-4 xl:flex
  "
        >
          <div
            className={`
      flex items-center
      gap-3 rounded-full
      border px-4 py-2

      ${
        status.infrastructure
          ? `
            border-green-400/20
            bg-green-400/10
          `
          : `
            border-red-400/20
            bg-red-400/10
          `
      }
    `}
          >
            <div
              className={`
        h-2.5 w-2.5
        rounded-full

        ${
          status.infrastructure
            ? `
              bg-green-400
              shadow-[0_0_14px_rgba(74,222,128,0.9)]
            `
            : `
              bg-red-400
              shadow-[0_0_14px_rgba(248,113,113,0.9)]
            `
        }
      `}
            />

            <span
              className="
        text-xs font-semibold
        uppercase
        tracking-[0.2em]
      "
            >
              {status.infrastructure ? "Operational" : "Degraded"}
            </span>
          </div>

          {status.activeIncidents > 0 && (
            <div
              className="
        flex items-center
        gap-3 rounded-full
        border border-yellow-400/20
        bg-yellow-400/10
        px-4 py-2
      "
            >
              <div
                className="
          h-2.5 w-2.5
          rounded-full
          bg-yellow-400
          shadow-[0_0_14px_rgba(250,204,21,0.9)]
        "
              />

              <span
                className="
          text-xs font-semibold
          uppercase
          tracking-[0.2em]
          text-yellow-300
        "
              >
                {status.activeIncidents} Active Alerts
              </span>
            </div>
          )}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open user menu"
                className="
                  flex h-12 w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-cyan-400/10
                  text-lg font-bold
                  text-cyan-300
                  transition
                  hover:bg-cyan-400/15
                  focus:outline-none
                  focus:ring-2
                  focus:ring-cyan-400/40
                "
              >
                {loading ? "" : avatarInitial}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="
                w-64 rounded-2xl
                border border-white/10
                bg-[#020617]
                p-2 text-slate-100
                shadow-2xl shadow-black/40
              "
            >
              <DropdownMenuLabel
                className="
                  px-3 py-3
                "
              >
                <p
                  className="
                    text-sm font-semibold
                    text-white
                  "
                >
                  {displayName}
                </p>

                {user?.email && user.email !== displayName && (
                  <p
                    className="
                      mt-1 truncate
                      text-xs text-slate-400
                    "
                  >
                    {user.email}
                  </p>
                )}
              </DropdownMenuLabel>

              <DropdownMenuSeparator
                className="
                  bg-white/10
                "
              />

              <DropdownMenuItem
                onSelect={logout}
                className="
                  mt-1 cursor-pointer
                  rounded-xl px-3 py-3
                  text-sm text-red-300
                  focus:bg-red-500/10
                  focus:text-red-200
                "
              >
                <LogOut
                  className="
                    h-4 w-4
                  "
                />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
