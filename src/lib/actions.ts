"use server";

import { db } from "@/lib/db";
import { members, teams, seasons, tournaments, users } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { createMemberSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/auth/password";
import { revalidatePath } from "next/cache";

// ─── Members ──────────────────────────────────────────────────

export async function getMembers() {
  return db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      dwz: members.dwz,
      elo: members.elo,
      role: members.role,
      status: members.status,
    })
    .from(members)
    .orderBy(desc(members.createdAt));
}

export async function getMemberById(id: string) {
  const [member] = await db.select().from(members).where(eq(members.id, id));
  return member;
}

export async function createMember(formData: FormData) {
  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
    gender: (formData.get("gender") as string) || undefined,
    dwz: formData.get("dwz") ? Number(formData.get("dwz")) : undefined,
    elo: formData.get("elo") ? Number(formData.get("elo")) : undefined,
    dwzId: (formData.get("dwzId") as string) || undefined,
    lichessUsername: (formData.get("lichessUsername") as string) || undefined,
    chesscomUsername: (formData.get("chesscomUsername") as string) || undefined,
    role: (formData.get("role") as string) || "mitglied",
    status: (formData.get("status") as string) || "active",
    parentId: (formData.get("parentId") as string) || undefined,
    photoConsent: formData.get("photoConsent") === "on",
    newsletterConsent: formData.get("newsletterConsent") === "on",
    resultPublicationConsent: formData.get("resultPublicationConsent") !== null
      ? formData.get("resultPublicationConsent") === "on"
      : true,
    notes: (formData.get("notes") as string) || undefined,
  };

  const validated = createMemberSchema.parse(rawData);

  const [member] = await db
    .insert(members)
    .values({
      ...validated,
      dateOfBirth: validated.dateOfBirth || null,
      parentId: validated.parentId || null,
    })
    .returning();

  // Optionally create a user account for the member
  const createAccount = formData.get("createAccount") === "on";
  if (createAccount) {
    const password = formData.get("password") as string;
    if (password) {
      const hashedPassword = await hashPassword(password);
      await db.insert(users).values({
        name: `${validated.firstName} ${validated.lastName}`,
        email: validated.email,
        role: validated.role,
        memberId: member.id,
        // Password will be stored via credentials provider
      });
    }
  }

  revalidatePath("/dashboard/members");
}

export async function deleteMember(id: string) {
  await db.delete(members).where(eq(members.id, id));
  revalidatePath("/dashboard/members");
}

// ─── Teams ────────────────────────────────────────────────────

export async function getTeams() {
  return db
    .select({
      id: teams.id,
      name: teams.name,
      seasonId: teams.seasonId,
      league: teams.league,
      captainId: teams.captainId,
    })
    .from(teams)
    .orderBy(desc(teams.createdAt));
}

export async function getSeasons() {
  return db.select().from(seasons).orderBy(desc(seasons.year));
}

// ─── Tournaments ──────────────────────────────────────────────

export async function getTournaments() {
  return db
    .select({
      id: tournaments.id,
      name: tournaments.name,
      type: tournaments.type,
      startDate: tournaments.startDate,
      location: tournaments.location,
      isCompleted: tournaments.isCompleted,
    })
    .from(tournaments)
    .orderBy(desc(tournaments.startDate));
}

// ─── Stats ────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [memberCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(members)
    .where(eq(members.status, "active"));

  const [teamCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teams);

  const [pendingPayments] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(members)
    .where(eq(members.status, "active"));

  return {
    memberCount: memberCount?.count ?? 0,
    teamCount: teamCount?.count ?? 0,
    pendingPayments: pendingPayments?.count ?? 0,
  };
}