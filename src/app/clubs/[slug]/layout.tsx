import { ReactNode } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/insforge";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { JsonLd } from "@/components/seo/JsonLd";

interface ClubLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClubLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const client = createServiceClient();
  const { data: rawClub, error } = await client
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching club for metadata:", error);
  }

  const club = rawClub
    ? {
        ...rawClub,
        isActive: rawClub.is_active,
        logoUrl: rawClub.logo_url,
        contactEmail: rawClub.contact_email,
      }
    : null;

  if (!club || !club.isActive) {
    return {
      title: "Club nicht gefunden",
    };
  }

  const description = `Offizielle Website von ${club.name}. Informationen über Mitglieder, Turniere und Aktivitäten des Schachvereins.`;

  return {
    title: club.name,
    description: description,
    openGraph: {
      title: club.name,
      description: description,
      images: club.logoUrl ? [{ url: club.logoUrl }] : [],
    },
    twitter: {
      card: "summary",
      title: club.name,
      description: description,
      images: club.logoUrl ? [club.logoUrl] : [],
    },
    alternates: {
      canonical: `/clubs/${slug}`,
    },
  };
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  const { slug } = await params;

  // Verify club exists
  const client = createServiceClient();
  const { data: rawClub, error } = await client
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching club for layout:", error);
  }

  const club = rawClub
    ? {
        ...rawClub,
        isActive: rawClub.is_active,
        logoUrl: rawClub.logo_url,
        contactEmail: rawClub.contact_email,
      }
    : null;

  if (!club || !club.isActive) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://schach.studio";

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsClub",
          name: club.name,
          url: `${baseUrl}/clubs/${club.slug}`,
          logo: club.logoUrl || `${baseUrl}/icons/icon-512.png`,
          address: club.address ? {
            "@type": "PostalAddress",
            streetAddress: club.address.street,
            postalCode: club.address.zipCode,
            addressLocality: club.address.city,
            addressCountry: club.address.country,
          } : undefined,
          email: club.contactEmail,
        }}
      />
      <Navbar clubName={club.name} clubSlug={club.slug} logoUrl={club.logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer clubName={club.name} />
    </div>
  );
}
