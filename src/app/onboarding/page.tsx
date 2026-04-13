import { redirect } from "next/navigation";
import { getSessionWithClub } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clubMemberships, clubs } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { OnboardingContent } from "./onboarding-content";

export default async function OnboardingPage() {
  const session = await getSessionWithClub();

  if (!session) {
    redirect("/auth/login");
  }

  // If user has active club, redirect to dashboard
  if (session.club) {
    redirect("/dashboard");
  }

  // Get all user's club memberships
  const memberships = await db
    .select({
      clubId: clubMemberships.clubId,
    })
    .from(clubMemberships)
    .where(
      and(
        eq(clubMemberships.memberId, session.user.memberId!),
        eq(clubMemberships.status, "active")
      )
    );

  const clubIds = memberships.map((m) => m.clubId);

  // Get full club details
  const userClubs = clubIds.length > 0
    ? await db
        .select({
          id: clubs.id,
          name: clubs.name,
          slug: clubs.slug,
          logoUrl: clubs.logoUrl,
          plan: clubs.plan,
          isActive: clubs.isActive,
        })
        .from(clubs)
        .where(inArray(clubs.id, clubIds))
    : [];

  const hasClubs = userClubs.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
              <span className="text-3xl">♔</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              Willkommen bei Schachverein
            </h1>
            <p className="text-muted-foreground text-lg">
              {hasClubs
                ? "Wählen Sie einen Verein aus oder erstellen Sie einen neuen"
                : "Erstellen Sie Ihren ersten Verein, um zu beginnen"}
            </p>
          </div>

          <OnboardingContent
            hasClubs={hasClubs}
            userClubs={userClubs.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              logoUrl: c.logoUrl,
              plan: c.plan as "free" | "pro" | "enterprise",
              isActive: c.isActive,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
