"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { clubs, members, authUsers, clubMemberships, teams, tournaments, seasons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const DEMO_EMAIL = "demo@schach.studio";
const DEMO_PASSWORD = "Demo2026!Studio";
const DEMO_CLUB_SLUG = "demo-springer";

/**
 * Server action to handle demo login
 * Creates demo data if not exists, then logs the user in
 */
export async function loginAsDemo() {
  const supabase = await createClient();

  // Try to sign in with demo credentials
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (signInData?.session) {
    // Demo user exists and login successful
    return { success: true, redirectTo: "/dashboard" };
  }

  // If sign-in failed, create demo user and data
  if (signInError?.code === "invalid_credentials") {
    // Check if demo club exists
    let demoClub = await db.query.clubs.findFirst({
      where: eq(clubs.slug, DEMO_CLUB_SLUG),
    });

    if (!demoClub) {
      // Create demo club
      const [newClub] = await db
        .insert(clubs)
        .values({
          name: "SC Demo Springer",
          slug: DEMO_CLUB_SLUG,
          contactEmail: DEMO_EMAIL,
          plan: "pro",
          isActive: true,
        })
        .returning();
      demoClub = newClub;

      // Create demo members with proper typing
      const demoMembersData: Array<{
        firstName: string;
        lastName: string;
        email: string;
        role: "vorstand" | "sportwart" | "jugendwart" | "trainer" | "mitglied";
        dwz: number;
      }> = [
        { firstName: "Max", lastName: "Mustermann", email: "max@demo.local", role: "vorstand", dwz: 1950 },
        { firstName: "Anna", lastName: "Schmidt", email: "anna@demo.local", role: "sportwart", dwz: 1800 },
        { firstName: "Peter", lastName: "Müller", email: "peter@demo.local", role: "mitglied", dwz: 1850 },
        { firstName: "Lisa", lastName: "Weber", email: "lisa@demo.local", role: "mitglied", dwz: 1920 },
        { firstName: "Thomas", lastName: "Schneider", email: "thomas@demo.local", role: "jugendwart", dwz: 1700 },
        { firstName: "Klaus", lastName: "Fischer", email: "klaus@demo.local", role: "mitglied", dwz: 1750 },
        { firstName: "Maria", lastName: "Meyer", email: "maria@demo.local", role: "trainer", dwz: 2000 },
        { firstName: "Wolfgang", lastName: "Koch", email: "wolfgang@demo.local", role: "mitglied", dwz: 2100 },
        { firstName: "Julia", lastName: "Bauer", email: "julia@demo.local", role: "mitglied", dwz: 1650 },
        { firstName: "Michael", lastName: "Hoffmann", email: "michael@demo.local", role: "mitglied", dwz: 1780 },
      ];

      const createdMemberIds: string[] = [];

      for (const memberData of demoMembersData) {
        const [member] = await db.insert(members).values({
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          email: memberData.email,
          role: memberData.role,
          dwz: memberData.dwz,
        }).returning();
        
        createdMemberIds.push(member.id);
        
        // Create club membership link
        await db.insert(clubMemberships).values({
          clubId: demoClub.id,
          memberId: member.id,
          role: memberData.role,
          isPrimary: true,
        });
      }

      // Create a season for the teams
      const currentYear = new Date().getFullYear();
      const [season] = await db.insert(seasons).values({
        clubId: demoClub.id,
        name: "Saison 2025/26",
        year: currentYear,
        type: "club_internal",
        startDate: "2025-09-01",
        endDate: "2026-06-30",
      }).returning();

      // Create demo teams
      await db.insert(teams).values({
        clubId: demoClub.id,
        seasonId: season.id,
        name: "1. Mannschaft",
        league: "Bezirksliga",
        captainId: createdMemberIds[0], // Max Mustermann
      });

      await db.insert(teams).values({
        clubId: demoClub.id,
        seasonId: season.id,
        name: "2. Mannschaft",
        league: "Kreisklasse",
        captainId: createdMemberIds[1], // Anna Schmidt
      });

      // Create demo tournaments
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 10);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      await db.insert(tournaments).values({
        clubId: demoClub.id,
        seasonId: season.id,
        name: "Vereinsmeisterschaft 2025",
        type: "round_robin",
        startDate: formatDate(lastMonth),
        endDate: formatDate(nextMonth),
        location: "Vereinsheim SC Demo Springer",
        description: "Offene Vereinsmeisterschaft für alle Mitglieder",
        timeControl: "90 min + 30 sek",
        numberOfRounds: 9,
        isCompleted: false,
      });

      await db.insert(tournaments).values({
        clubId: demoClub.id,
        seasonId: season.id,
        name: "Blitzturnier Sommer 2025",
        type: "swiss",
        startDate: formatDate(nextMonth),
        location: "Vereinsheim",
        description: "Schnellschach-Turnier mit 5 Minuten Bedenkzeit",
        timeControl: "5 min",
        numberOfRounds: 7,
        isCompleted: false,
      });

      await db.insert(tournaments).values({
        clubId: demoClub.id,
        seasonId: season.id,
        name: "Rapidturnier Frühling 2025",
        type: "swiss",
        startDate: formatDate(lastMonth),
        endDate: formatDate(lastMonth),
        location: "Vereinsheim",
        description: "Abgeschlossenes Rapid-Turnier",
        timeControl: "15 min + 10 sek",
        numberOfRounds: 5,
        isCompleted: true,
      });
    }

    // Create demo auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      options: {
        data: {
          name: "Demo Vorstand",
        },
      },
    });

    if (signUpError) {
      console.error("Demo signup error:", signUpError);
      return { success: false, error: "Demo-Benutzer konnte nicht erstellt werden" };
    }

    if (signUpData.user) {
      // Find the demo club's vorstand member
      const demoVorstand = await db.query.members.findFirst({
        where: eq(members.email, "max@demo.local"),
      });

      // Create auth_user entry with club association
      await db.insert(authUsers).values({
        id: signUpData.user.id,
        email: DEMO_EMAIL,
        name: "Demo Vorstand",
        role: "vorstand",
        activeClubId: demoClub.id,
        memberId: demoVorstand?.id,
        permissions: [],
        emailVerified: true,
      });

      // Confirm email and sign in again
      const { data: finalSignIn, error: finalError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (finalSignIn?.session) {
        return { success: true, redirectTo: "/dashboard" };
      }
    }
  }

  return { success: false, error: "Demo-Login fehlgeschlagen" };
}

/**
 * Redirect wrapper for demo login form
 */
export async function redirectToDemo() {
  const result = await loginAsDemo();
  
  if (result.success && result.redirectTo) {
    redirect(result.redirectTo);
  }
  
  // If login failed, redirect to login page with error
  redirect("/auth/login?error=demo_failed");
}
