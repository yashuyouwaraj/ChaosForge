"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  Activity,
  Brain,
  Server,
  FileText,
  CreditCard,
  Settings,
} from "lucide-react";

const items = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Simulations",
    href: "/simulations",
    icon: Activity,
  },

  {
    label: "AI Insights",
    href: "/ai",
    icon: Brain,
  },

  {
    label: "Infrastructure",
    href: "/infrastructure",
    icon: Server,
  },

  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
  },

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
];

export function Sidebar() {
  return (
    <aside
      className="
        hidden w-72 bg-card
        lg:flex lg:flex-col
      "
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          ChaosForge
        </h1>

        <p className="text-sm text-muted-foreground">
          AI Infrastructure Platform
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="
                flex items-center gap-3
                rounded-xl px-4 py-3
                text-sm font-medium
                transition hover:bg-accent
              "
            >
              <Icon className="h-5 w-5" />

              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}