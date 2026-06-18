import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { ProjectProvider } from "@/components/providers/ProjectProvider";
import { RunProvider } from "@/components/providers/RunProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { PlatformProvider } from "@/components/providers/PlatformProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ChaosForge",
  description:
    "AI-native distributed infrastructure intelligence platform for realtime observability, Kafka event streaming, distributed load testing, and production-grade telemetry.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <AuthProvider>
            <SettingsProvider>
              <ProjectProvider>
                <PlatformProvider>
                  <RunProvider>{children}</RunProvider>
                </PlatformProvider>
              </ProjectProvider>
            </SettingsProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
