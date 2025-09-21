import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SocialHive Enhanced - Creator Platform",
  description:
    "Enhanced SocialHive with AI-powered tools and advanced analytics",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${playfair.variable}`}
      >
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
