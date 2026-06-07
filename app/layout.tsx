import type { Metadata } from "next";
import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Lunaria Agency — AI Marketing Suite",
  description: "Premium AI-powered marketing agency dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen p-8 bg-canvas">{children}</main>
        </div>
      </body>
    </html>
  );
}
