import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { ProjectProvider } from "@/components/providers/ProjectProvider";
import { RunProvider } from "@/components/providers/RunProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

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
        <AuthProvider>
          <ProjectProvider>
            <RunProvider>{children}</RunProvider>
          </ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
