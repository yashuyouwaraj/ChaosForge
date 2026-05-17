"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlatformStatus } from "@/hooks/usePlatformStatus";

import {
  LayoutDashboard,
  Activity,
  Brain,
  Server,
  FileText,
  CreditCard,
  Book,
  Settings,
  Radio,
  ShieldCheck,
} from "lucide-react";

const groups = [
  {
    title: "Operations",

    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Projects",
        href: "/projects",
        icon: Book,
      },

      {
        label: "Simulations",
        href: "/simulations",
        icon: Activity,
      },

      {
        label: "Infrastructure",
        href: "/infrastructure",
        icon: Server,
      },
    ],
  },

  {
    title: "Observability",

    items: [
      {
        label: "Observability",
        href: "/observability",
        icon: Radio,
      },

      {
        label: "AI Insights",
        href: "/ai",
        icon: Brain,
      },

      {
        label: "Reports",
        href: "/reports",
        icon: FileText,
      },
    ],
  },

  {
    title: "Workspace",

    items: [
      {
        label: "Billing",
        href: "/billing",
        icon: CreditCard,
      },

      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function Sidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();
  const status = usePlatformStatus();

  return (
    <aside
      className={`
  fixed inset-y-0 left-0
  z-50 flex w-[290px]
  flex-col
  border-r border-white/10
  bg-black/70
  backdrop-blur-2xl
  transition-transform
  duration-300

  ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

  lg:static
  lg:translate-x-0
`}
    >
      {/* BRAND */}

      <div
        className="
          border-b border-white/10
          px-7 py-7
        "
      >
        <div
          className="
            flex items-center gap-4
          "
        >
          <div
            className="
              flex h-14 w-14
              items-center justify-center
              rounded-2xl
              bg-cyan-400/10
              text-cyan-300
            "
          >
            <ShieldCheck
              className="
                h-7 w-7
              "
            />
          </div>

          <div>
            <h1
              className="
                text-2xl font-black
              "
            >
              ChaosForge
            </h1>

            <p
              className="
                mt-1 text-xs
                uppercase
                tracking-[0.25em]
                text-cyan-400
              "
            >
              Infrastructure OS
            </p>
          </div>
        </div>
      </div>

      {/* NAV */}

      <nav
        className="
          flex-1 overflow-y-auto
          px-4
        "
      >
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.title}>
              <p
                className="
                  mb-3 px-4
                  text-xs uppercase
                  tracking-[0.25em]
                  text-slate-500
                "
              >
                {group.title}
              </p>

              <div className="space-y-2">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                            group flex
                            items-center gap-4
                            rounded-2xl
                            px-4 py-3
                            text-sm font-medium
                            transition-all
                            duration-200

                                          ${
                                            pathname === item.href
                                              ? `
                                                bg-cyan-400/15
                                                text-cyan-300
                                                shadow-[0_0_25px_rgba(34,211,238,0.12)]
                                              `
                                              : `
                                                text-slate-300
                                                hover:bg-cyan-400/10
                                                hover:text-cyan-300
                                              `
                                          }
                                        `}
                    >
                      <Icon
                        className="
                            h-5 w-5
                            transition-transform
                            duration-200
                            group-hover:scale-110
                          "
                      />

                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="">
        <div
          className="
      rounded-2xl
      border border-white/10
      bg-black/20
      p-5
    "
        >
          <div
            className="
        flex items-center
        justify-between
      "
          >
            <div>
              <p
                className="
            text-[10px]
            uppercase
            tracking-[0.25em]
            text-slate-500
          "
              >
                Active Simulation
              </p>

              <h4
                className="
            mt-2 text-lg
            font-bold
            text-cyan-300
          "
              >
                {status.simulation ? "Running" : "Idle"}
              </h4>
            </div>

            <div
              className={`
          h-3 w-3 rounded-full
          ${
            status.simulation
              ? "bg-green-400 shadow-[0_0_16px_rgba(74,222,128,0.9)]"
              : "bg-slate-600"
          }
        `}
            />
          </div>

          <div
            className="
        mt-4 text-xs
        text-slate-500
      "
          >
            {status.simulation && status.runId
              ? `${status.runId.slice(0, 12)}...`
              : "No active infrastructure load"}
          </div>
        </div>
      </div>

      {/* STATUS */}

      <div
        className="
          border-t border-white/10
          p-5
        "
      >
        <div
          className="
            rounded-2xl
            border border-cyan-400/20
            bg-cyan-400/[0.04]
            p-4
          "
        >
          <div
            className="
              flex items-center
              gap-3
            "
          >
            <div
              className="
                h-3 w-3
                rounded-full
                bg-green-400
                shadow-[0_0_16px_rgba(74,222,128,0.9)]
              "
            />

            <div>
              <p
                className="
                  text-xs uppercase
                  tracking-[0.2em]
                  text-slate-400
                "
              >
                Platform Status
              </p>

              <h4
                className="
                  mt-1 text-sm
                  font-bold text-green-400
                "
              >
                Operational
              </h4>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
