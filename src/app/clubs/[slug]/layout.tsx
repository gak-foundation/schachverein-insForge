import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { clubs } from "@/lib/db/schema";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

interface ClubLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  const { slug } = await params;

  // Verify club exists
  const club = await db.query.clubs.findFirst({
    where: eq(clubs.slug, slug),
  });

  if (!club || !club.isActive) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar clubName={club.name} clubSlug={club.slug} logoUrl={club.logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer clubName={club.name} />
    </div>
  );
}
