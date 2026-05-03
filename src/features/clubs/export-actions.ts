"use server";

import { createServiceClient } from "@/lib/insforge";
import { requireClubId } from "@/lib/auth/session";
import { decrypt } from "@/lib/crypto";
import { exportMembersToCSV } from "@/lib/csv/members";

/**
 * Generates a comprehensive data bundle for the entire club.
 * Requirement: Right to data portability and vendor lock-in mitigation.
 */
export async function exportClubDataBundle() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  // 1. Fetch Club Metadata
  const { data: club, error: clubError } = await client
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single();

  if (clubError || !club) throw new Error("Verein nicht gefunden");

  // 2. Fetch Members (with Decryption)
  const { data: membersList, error: membersError } = await client
    .from('club_memberships')
    .select('*, members!member_id(*)')
    .eq('club_id', clubId);

  if (membersError) throw new Error("Fehler beim Laden der Mitglieder");

  const decryptedMembers = (membersList || []).map((m: any) => ({
    id: m.members.id,
    firstName: m.members.first_name,
    lastName: m.members.last_name,
    email: m.members.email,
    phone: m.members.phone,
    dateOfBirth: m.members.date_of_birth,
    gender: m.members.gender,
    dwz: m.members.dwz,
    elo: m.members.elo,
    dwzId: m.members.dwz_id,
    lichessUsername: m.members.lichess_username,
    chesscomUsername: m.members.chesscom_username,
    status: m.members.status,
    role: m.role,
    joinedAt: m.joined_at,
    photoConsent: m.members.photo_consent,
    newsletterConsent: m.members.newsletter_consent,
    notes: m.members.notes,
    medicalNotes: m.members.medical_notes,
    emergencyContactName: m.members.emergency_contact_name,
    emergencyContactPhone: m.members.emergency_contact_phone,
    sepaIban: m.members.sepa_iban,
    sepaBic: m.members.sepa_bic,
    sepaMandateReference: m.members.sepa_mandate_reference,
  }));

  const decryptedMembersFinal = decryptedMembers.map(m => ({
    ...m,
    sepaIban: m.sepaIban ? decrypt(m.sepaIban) : null,
    sepaBic: m.sepaBic ? decrypt(m.sepaBic) : null,
    medicalNotes: m.medicalNotes ? decrypt(m.medicalNotes) : null,
  }));

  // 3. Fetch Financial Data
  const { data: paymentRecords, error: paymentsError } = await client
    .from('payments')
    .select('*')
    .eq('club_id', clubId);

  if (paymentsError) throw new Error("Fehler beim Laden der Zahlungen");

  const { data: rates, error: ratesError } = await client
    .from('contribution_rates')
    .select('*')
    .eq('club_id', clubId);

  if (ratesError) throw new Error("Fehler beim Laden der Beitragssaetze");

  // 4. Fetch Sport Data
  const { data: tournamentList, error: tournamentsError } = await client
    .from('tournaments')
    .select('*')
    .eq('club_id', clubId);

  if (tournamentsError) throw new Error("Fehler beim Laden der Turniere");

  const { data: seasonList, error: seasonsError } = await client
    .from('seasons')
    .select('*')
    .eq('club_id', clubId);

  if (seasonsError) throw new Error("Fehler beim Laden der Saisons");

  const { data: teamList, error: teamsError } = await client
    .from('teams')
    .select('*')
    .eq('club_id', clubId);

  if (teamsError) throw new Error("Fehler beim Laden der Mannschaften");

  // 5. Fetch Calendar
  const { data: eventList, error: eventsError } = await client
    .from('events')
    .select('*')
    .eq('club_id', clubId);

  if (eventsError) throw new Error("Fehler beim Laden der Termine");

  // Assemble Bundle
  const bundle = {
    metadata: {
      clubName: club.name,
      slug: club.slug,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    },
    members: decryptedMembersFinal,
    finance: {
      payments: paymentRecords || [],
      contributionRates: rates || [],
    },
    sport: {
      seasons: seasonList || [],
      teams: teamList || [],
      tournaments: tournamentList || [],
    },
    calendar: {
      events: eventList || [],
    },
    // Include a CSV version of members for easy reading
    csvExports: {
      members: exportMembersToCSV(decryptedMembersFinal as any),
    }
  };

  return bundle;
}
