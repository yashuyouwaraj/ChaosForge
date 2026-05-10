"use client";

import { Sidebar } from "../sidebar/Sidebar";
import { Navbar } from "../navbar/Navbar";

export function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-white text-black">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}