import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://schach.studio"),
  title: {
    default: "Schachverein",
    template: "%s | Schachverein",
  },
  description: "Vereinsverwaltung für Schachvereine — Mitglieder, Turniere, Mannschaften, DWZ",
  keywords: ["Schach", "Verein", "Verwaltung", "Turnier", "Mitglieder", "DWZ"],
  authors: [{ name: "schach.studio" }],
  creator: "schach.studio",
  publisher: "schach.studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://schach.studio",
    siteName: "schach.studio",
    title: "Schachverein — Die moderne Vereinsverwaltung",
    description: "Vereinsverwaltung für Schachvereine — Mitglieder, Turniere, Mannschaften, DWZ",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "schach.studio Vereinsverwaltung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Schachverein — Die moderne Vereinsverwaltung",
    description: "Vereinsverwaltung für Schachvereine — Mitglieder, Turniere, Mannschaften, DWZ",
    images: ["/icons/icon-512.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
