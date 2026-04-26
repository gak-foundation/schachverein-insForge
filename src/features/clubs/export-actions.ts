"use server";

import { db } from "@/lib/db";
import { 
  members, 
  clubMemberships, 
  payments, 
  tournaments, 
  teams, 
  events, 
  clubs,
  contributionRates,
  seasons
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireClubId } from "@/lib/auth/session";
import { decrypt } from "@/lib/crypto";
import { exportMembersToCSV } from "@/lib/csv/members";

/**
 * Generates a comprehensive data bundle for the entire club.
 * Requirement: Right to data portability and vendor lock-in mitigation.
 */
export async function exportClubDataBundle() {
  const clubId = await requireClubId();

  // 1. Fetch Club Metadata
  const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
  if (!club) throw new Error("Verein nicht gefunden");

  // 2. Fetch Members (with Decryption)
  const membersList = await db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      phone: members.phone,
      dateOfBirth: members.dateOfBirth,
      gender: members.gender,
      dwz: members.dwz,
      elo: members.elo,
      dwzId: members.dwzId,
      lichessUsername: members.lichessUsername,
      chesscomUsername: members.chesscomUsername,
      status: members.status,
      role: clubMemberships.role,
      joinedAt: clubMemberships.joinedAt,
      photoConsent: members.photoConsent,
      newsletterConsent: members.newsletterConsent,
      notes: members.notes,
      medicalNotes: members.medicalNotes,
      emergencyContactName: members.emergencyContactName,
      emergencyContactPhone: members.emergencyContactPhone,
      sepaIban: members.sepaIban,
      sepaBic: members.sepaBic,
      sepaMandateReference: members.sepaMandateReference,
    })
    .from(clubMemberships)
    .innerJoin(members, eq(clubMemberships.memberId, members.id))
    .where(eq(clubMemberships.clubId, clubId));

  const decryptedMembers = membersList.map(m => ({
    ...m,
    sepaIban: m.sepaIban ? decrypt(m.sepaIban) : null,
    sepaBic: m.sepaBic ? decrypt(m.sepaBic) : null,
    medicalNotes: m.medicalNotes ? decrypt(m.medicalNotes) : null,
  }));

  // 3. Fetch Financial Data
  const paymentRecords = await db
    .select()
    .from(payments)
    .where(eq(payments.clubId, clubId));

  const rates = await db
    .select()
    .from(contributionRates)
    .where(eq(contributionRates.clubId, clubId));

  // 4. Fetch Sport Data
  const tournamentList = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.clubId, clubId));

  const seasonList = await db
    .select()
    .from(seasons)
    .where(eq(seasons.clubId, clubId));

  const teamList = await db
    .select()
    .from(teams)
    .where(eq(teams.clubId, clubId));

  // 5. Fetch Calendar
  const eventList = await db
    .select()
    .from(events)
    .where(eq(events.clubId, clubId));

  // Assemble Bundle
  const bundle = {
    metadata: {
      clubName: club.name,
      slug: club.slug,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    },
    members: decryptedMembers,
    finance: {
      payments: paymentRecords,
      contributionRates: rates,
    },
    sport: {
      seasons: seasonList,
      teams: teamList,
      tournaments: tournamentList,
    },
    calendar: {
      events: eventList,
    },
    // Include a CSV version of members for easy reading
    csvExports: {
      members: exportMembersToCSV(decryptedMembers as any),
    }
  };

  return bundle;
}
