"use server";

import { db } from "@/lib/db";
import { members, clubMemberships, dwzHistory, authUsers, seasons, tournaments, games } from "@/lib/db/schema";
import { eq, desc, and, or, sql, SQL } from "drizzle-orm";
import { createMemberSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { logMemberAction } from "@/lib/audit";
import { createInvitation } from "@/lib/auth/invitations";
import { requireClubId } from "./utils";

export async function getMembers(search?: string, role?: string, status?: string) {
  const clubId = await requireClubId();

  const conditions: (SQL<unknown> | undefined)[] = [
    eq(clubMemberships.clubId, clubId),
  ];

  if (search) {
    conditions.push(
      or(
        sql`${members.firstName} ILIKE ${`%${search}%`}`,
        sql`${members.lastName} ILIKE ${`%${search}%`}`,
        sql`${members.email} ILIKE ${`%${search}%`}`
      )
    );
  }

  if (role) {
    conditions.push(eq(clubMemberships.role, role as any));
  }

  if (status) {
    conditions.push(eq(members.status, status as any));
  }

  return db
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
      role: clubMemberships.role,
      status: members.status,
      photoConsent: members.photoConsent,
      newsletterConsent: members.newsletterConsent,
      notes: members.notes,
      createdAt: members.createdAt,
    })
    .from(clubMemberships)
    .innerJoin(members, eq(clubMemberships.memberId, members.id))
    .where(and(...conditions.filter(Boolean)))
    .orderBy(desc(members.createdAt));
}

export async function getMemberById(id: string) {
  const clubId = await requireClubId();

  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(and(
      eq(clubMemberships.memberId, id),
      eq(clubMemberships.clubId, clubId)
    ));

  if (!membership) {
    return null;
  }

  const [member] = await db.select().from(members).where(eq(members.id, id));
  return member;
}

export async function createMember(formData: FormData) {
  const clubId = await requireClubId();

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

  await db.insert(clubMemberships).values({
    clubId,
    memberId: member.id,
    role: validated.role as any,
  });

  await logMemberAction("CREATED", member.id, {
    firstName: { old: null, new: member.firstName },
    lastName: { old: null, new: member.lastName },
    email: { old: null, new: member.email },
    role: { old: null, new: validated.role },
  });

  const createAccount = formData.get("createAccount") === "on";
  if (createAccount) {
    const result = await createInvitation(member.id);
    if (result.success) {
      console.log(`Einladung erstellt fuer ${validated.email}: ${result.inviteUrl}`);
    }
  }

  revalidatePath("/dashboard/members");
}

export async function deleteMember(id: string) {
  const clubId = await requireClubId();

  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(and(
      eq(clubMemberships.memberId, id),
      eq(clubMemberships.clubId, clubId)
    ));

  if (!membership) {
    throw new Error("Mitglied nicht gefunden");
  }

  const member = await getMemberById(id);

  await db
    .update(clubMemberships)
    .set({ status: "inactive" })
    .where(and(
      eq(clubMemberships.memberId, id),
      eq(clubMemberships.clubId, clubId)
    ));

  await logMemberAction("DELETED", id, {
    firstName: { old: member?.firstName, new: null },
    lastName: { old: member?.lastName, new: null },
    email: { old: member?.email, new: null },
  });

  revalidatePath("/dashboard/members");
}

export async function updateMember(formData: FormData) {
  const clubId = await requireClubId();
  const id = formData.get("id") as string;

  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(and(
      eq(clubMemberships.memberId, id),
      eq(clubMemberships.clubId, clubId)
    ));

  if (!membership) {
    throw new Error("Mitglied nicht gefunden");
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const dwz = formData.get("dwz") ? Number(formData.get("dwz")) : null;
  const status = formData.get("status") as string;
  const role = formData.get("role") as string;

  await db
    .update(members)
    .set({
      firstName,
      lastName,
      email,
      phone,
      dwz,
      status: status as any,
    })
    .where(eq(members.id, id));

  if (role) {
    await db
      .update(clubMemberships)
      .set({ role: role as any })
      .where(and(
        eq(clubMemberships.memberId, id),
        eq(clubMemberships.clubId, clubId)
      ));
  }

  revalidatePath("/dashboard/members");
}

export async function getDWZHistory(memberId: string) {
  const clubId = await requireClubId();

  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(and(
      eq(clubMemberships.memberId, memberId),
      eq(clubMemberships.clubId, clubId)
    ));

  if (!membership) {
    throw new Error("Mitglied ist nicht im Verein");
  }

  return db
    .select()
    .from(dwzHistory)
    .where(eq(dwzHistory.memberId, memberId))
    .orderBy(desc(dwzHistory.recordedAt));
}

export async function addDWZEntry(formData: FormData) {
  const clubId = await requireClubId();

  const memberId = formData.get("memberId") as string;
  const dwz = Number(formData.get("dwz"));
  const elo = formData.get("elo") ? Number(formData.get("elo")) : null;
  const source = (formData.get("source") as string) || "manual";
  const recordedAt = formData.get("recordedAt") as string;

  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(and(
      eq(clubMemberships.memberId, memberId),
      eq(clubMemberships.clubId, clubId)
    ));

  if (!membership) {
    throw new Error("Mitglied ist nicht im Verein");
  }

  await db.insert(dwzHistory).values({
    memberId,
    dwz,
    elo,
    source,
    recordedAt,
  });

  await db
    .update(members)
    .set({ dwz })
    .where(eq(members.id, memberId));

  revalidatePath("/dashboard/members");
}

export async function getDwzHistory(memberId: string) {
  return getDWZHistory(memberId);
}

export async function updateUserRole(formData: FormData) {
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  if (!userId || !role) {
    throw new Error("User ID und Rolle sind erforderlich");
  }

  const clubId = await requireClubId();

  await db
    .update(authUsers)
    .set({ role: role as any })
    .where(eq(authUsers.id, userId));

  revalidatePath("/dashboard/admin/users");
}
