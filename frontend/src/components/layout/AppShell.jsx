"use client";

import { useState } from "react";

import { Sidebar } from "../sidebar/Sidebar";

import { Navbar } from "../navbar/Navbar";

export function AppShell({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      className="
        flex min-h-screen
        bg-[#020617]
        text-white
      "
    >
      {/* MOBILE OVERLAY */}

      {mobileSidebarOpen && (
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="
            fixed inset-0 z-40
            bg-black/70
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* SIDEBAR */}

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* CONTENT */}

      <div
        className="
          flex min-w-0
          flex-1 flex-col
        "
      >
        {/* NAVBAR */}

        <Navbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

        {/* PAGE */}

        <main
          className="
            flex-1 overflow-x-hidden
            px-4 py-4
            sm:px-6 sm:py-6
            lg:px-8
          "
        >
          <div
            className="
              mx-auto w-full
              max-w-[1700px]
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
