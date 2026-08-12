import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gmdexai.xyz"),
  title: "GMDEXAI | Autonomous AI Swaps & Liquidity on Base",
  description: "Execute autonomous AI swaps, manage liquidity, and trade with zero friction on Base with GMDEXAI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GMDEXAI",
  },
  other: {
    "base:app_id": "6a488e6c2876ee6c1138a856",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="base:app_id" content="6a488e6c2876ee6c1138a856" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <ServiceWorkerRegistration />
          <PWAInstallBanner />
        </Providers>
      </body>
    </html>
  );
}

