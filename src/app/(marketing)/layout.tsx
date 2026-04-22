import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { JsonLd } from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "schach.studio | Die moderne Schachvereins-Verwaltung",
  description: "Organisiere deinen Schachverein effizient: Mitglieder, Turniere, Finanzen und mehr an einem zentralen Ort.",
  openGraph: {
    title: "schach.studio | Die moderne Schachvereins-Verwaltung",
    description: "Organisiere deinen Schachverein effizient: Mitglieder, Turniere, Finanzen und mehr an einem zentralen Ort.",
    type: "website",
    url: "https://schach.studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "schach.studio | Die moderne Schachvereins-Verwaltung",
    description: "Organisiere deinen Schachverein effizient: Mitglieder, Turniere, Finanzen und mehr an einem zentralen Ort.",
  },
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col font-sans`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "schach.studio",
          url: "https://schach.studio",
          logo: "https://schach.studio/icons/icon-512.png",
          description: "Die moderne Schachvereins-Verwaltung für Mitglieder, Turniere und Finanzen.",
          sameAs: [
            "https://twitter.com/schach_studio",
            // Add other social links if available
          ],
        }}
      />
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}

