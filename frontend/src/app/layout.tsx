import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "FinAlly — AI Trading Workstation",
  description:
    "Live market data, simulated portfolio, and an AI copilot. Built by agents.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-primary text-gray-100 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}