"use server";

import { db } from "@/lib/db";
import { 
  members, 
  clubMemberships, 
  dwzHistory, 
  authUsers, 
  contributionRates,
  memberStatusHistory 
} from "@/lib/db/schema";
import { eq, desc, asc, and, or, sql, SQL } from "drizzle-orm";
import { createMemberSchema } from "@/lib/validations";
import { updateUserRoleSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";
import { logMemberAction } from "@/lib/audit";
import { createInvitation } from "@/lib/auth/invitations";
import { getSession } from "@/lib/auth/session";
import { PERMISSIONS, getPermissionsForRole, hasPermission } from "@/lib/auth/permissions";
import { fetchLichessProfile, getBestLichessRating } from "@/lib/lichess";
import { requireClubId } from "./utils";

type ClubMemberRole = typeof clubMemberships.$inferSelect.role;
type MemberRecordStatus = typeof members.$inferSelect.status;

export type MemberSortField = "name" | "email" | "dwz" | "elo" | "role" | "status" | "createdAt";
export type SortOrder = "asc" | "desc";

export async function getMembers(
  search?: string,
  role?: string,
  status?: string,
  sortBy: MemberSortField = "name",
  sortOrder: SortOrder = "asc",
  page: number = 1,
  pageSize: number = 25
) {
  const clubId = await requireClubId();
  const offset = (page - 1) * pageSize;

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
    conditions.push(eq(clubMemberships.role, role as ClubMemberRole));
  }

  if (status) {
    conditions.push(eq(members.status, status as MemberRecordStatus));
  }

  let orderBy: SQL<unknown>;
  const orderFn = sortOrder === "desc" ? desc : asc;

  switch (sortBy) {
    case "name":
      orderBy = sql`${orderFn(members.lastName)}, ${orderFn(members.firstName)}`;
      break;
    case "email":
      orderBy = orderFn(members.email);
      break;
    case "dwz":
      orderBy = orderFn(members.dwz);
      break;
    case "elo":
      orderBy = orderFn(members.elo);
      break;
    case "role":
      orderBy = orderFn(clubMemberships.role);
      break;
    case "status":
      orderBy = orderFn(members.status);
      break;
    case "createdAt":
      orderBy = orderFn(members.createdAt);
      break;
    default:
      orderBy = desc(members.createdAt);
  }

  const query = db
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
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset);

  const totalCountQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(clubMemberships)
    .innerJoin(members, eq(clubMemberships.memberId, members.id))
    .where(and(...conditions.filter(Boolean)));

  const [membersList, [totalCountResult]] = await Promise.all([
    query,
    totalCountQuery,
  ]);

  return {
    members: membersList,
    totalCount: Number(totalCountResult?.count ?? 0),
    totalPages: Math.ceil(Number(totalCountResult?.count ?? 0) / pageSize),
  };
}

export async function getMembersForForms() {
  const { members } = await getMembers(undefined, undefined, undefined, "name", "asc", 1, 10_000);
  return members;
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

  const member = await db.query.members.findFirst({
    where: eq(members.id, id),
    with: {
      parent: true,
      children: true,
    },
  });

  return member;
}

export async function getMemberStatusHistory(memberId: string) {
  const clubId = await requireClubId();

  // Check if member belongs to club
  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(and(
      eq(clubMemberships.memberId, memberId),
      eq(clubMemberships.clubId, clubId)
    ));

  if (!membership) {
    throw new Error("Mitglied nicht gefunden");
  }

  return db
    .select()
    .from(memberStatusHistory)
    .where(eq(memberStatusHistory.memberId, memberId))
    .orderBy(desc(memberStatusHistory.changedAt));
}

export async function getContributionRatesForMemberSelect() {
  const clubId = await requireClubId();

  return db
    .select({
      id: contributionRates.id,
      name: contributionRates.name,
      amount: contributionRates.amount,
    })
    .from(contributionRates)
    .where(eq(contributionRates.clubId, clubId))
    .orderBy(contributionRates.name);
}

export async function createMember(formData: FormData) {
  const clubId = await requireClubId();
  const session = await getSession();

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
    role: validated.role,
  });

  // Record initial status in history
  await db.insert(memberStatusHistory).values({
    memberId: member.id,
    newStatus: validated.status as "active" | "inactive" | "resigned" | "honorary",
    reason: "Mitglied angelegt",
    changedBy: session?.user.id,
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
  const session = await getSession();

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

  // Record status change in history
  if (member && member.status !== "inactive") {
    await db.insert(memberStatusHistory).values({
      memberId: id,
      oldStatus: member.status,
      newStatus: "inactive",
      reason: "Mitglied deaktiviert (gelöscht)",
      changedBy: session?.user.id,
    });

    await db.update(members).set({ status: "inactive" }).where(eq(members.id, id));
  }

  await logMemberAction("DELETED", id, {
    firstName: { old: member?.firstName, new: null },
    lastName: { old: member?.lastName, new: null },
    email: { old: member?.email, new: null },
  });

  revalidatePath("/dashboard/members");
}

export async function updateMember(formData: FormData) {
  const clubId = await requireClubId();
  const session = await getSession();
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

  const currentMember = await getMemberById(id);
  if (!currentMember) throw new Error("Mitglied nicht gefunden");

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const dwz = formData.get("dwz") ? Number(formData.get("dwz")) : null;
  const status = formData.get("status") as string;
  const role = formData.get("role") as string;
  const sepaIban = (formData.get("sepaIban") as string) || null;
  const sepaBic = (formData.get("sepaBic") as string) || null;
  const sepaMandateReference = (formData.get("sepaMandateReference") as string) || null;
  const mandateSignedAt = (formData.get("mandateSignedAt") as string) || null;
  const contributionRateId = (formData.get("contributionRateId") as string) || null;

  // Record status change if it changed
  if (status !== currentMember.status) {
    await db.insert(memberStatusHistory).values({
      memberId: id,
      oldStatus: currentMember.status,
      newStatus: status as MemberRecordStatus,
      reason: "Status manuell aktualisiert",
      changedBy: session?.user.id,
    });
  }

  await db
    .update(members)
    .set({
      firstName,
      lastName,
      email,
      phone,
      dwz,
      status: status as MemberRecordStatus,
      sepaIban,
      sepaBic,
      sepaMandateReference,
      mandateSignedAt,
      contributionRateId,
    })
    .where(eq(members.id, id));

  if (role) {
    await db
      .update(clubMemberships)
      .set({ role: role as ClubMemberRole })
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

import { fetchDwzData } from "@/lib/dwz";

export async function syncMemberDwz(memberId: string) {
  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId));

  if (!member || !member.dwzId) {
    return { success: false, error: "Keine DWZ-ID vorhanden" };
  }

  const data = await fetchDwzData(member.dwzId);
  if (!data) {
    return { success: false, error: "Daten konnten nicht von DeWIS abgerufen werden" };
  }

  // Only update if changed
  if (data.dwz !== member.dwz) {
    await db
      .update(members)
      .set({ dwz: data.dwz })
      .where(eq(members.id, memberId));

    await db.insert(dwzHistory).values({
      memberId,
      dwz: data.dwz,
      elo: member.elo,
      source: "dewis-sync",
      recordedAt: new Date().toISOString().split("T")[0],
    });

    return { success: true, oldDwz: member.dwz, newDwz: data.dwz };
  }

  return { success: true, changed: false };
}

export async function syncAllMembersDwz() {
  const clubId = await requireClubId();

  const allMembersWithId = await db
    .select({
      id: members.id,
      dwzId: members.dwzId,
    })
    .from(members)
    .innerJoin(clubMemberships, eq(members.id, clubMemberships.memberId))
    .where(and(
      eq(clubMemberships.clubId, clubId),
      sql`${members.dwzId} IS NOT NULL`
    ));

  let updatedCount = 0;
  let errorCount = 0;

  for (const m of allMembersWithId) {
    try {
      const result = await syncMemberDwz(m.id);
      if (result.success && result.newDwz !== undefined) {
        updatedCount++;
      }
    } catch (err) {
      console.error(`Error syncing member ${m.id}:`, err);
      errorCount++;
    }
    // Rate limiting to avoid blocking
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  revalidatePath("/dashboard/members");
  return { updatedCount, errorCount, total: allMembersWithId.length };
}

const ALL_PERMISSION_VALUES = new Set(Object.values(PERMISSIONS));

export async function updateUserRole(formData: FormData) {
  const session = await getSession();
  if (
    !session ||
    !hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.ADMIN_USERS)
  ) {
    throw new Error("Nicht autorisiert");
  }

  const permissionsRaw = formData.getAll("permissions").map(String);
  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    permissions: permissionsRaw,
  });

  if (!parsed.success) {
    throw new Error("Ungueltige Eingaben");
  }

  const { userId, role } = parsed.data;
  const rolePermSet = new Set(getPermissionsForRole(role));
  const additional = parsed.data.permissions.filter(
    (p) => ALL_PERMISSION_VALUES.has(p as (typeof PERMISSIONS)[keyof typeof PERMISSIONS]) && !rolePermSet.has(p as never),
  );

  await db
    .update(authUsers)
    .set({
      role: role as (typeof authUsers.$inferInsert)["role"],
      permissions: additional,
      updatedAt: new Date(),
    })
    .where(eq(authUsers.id, userId));

  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}/edit`);
}

export async function syncLichessRating(memberId: string) {
  const clubId = await requireClubId();

  const [member] = await db
    .select()
    .from(members)
    .innerJoin(clubMemberships, eq(members.id, clubMemberships.memberId))
    .where(and(eq(members.id, memberId), eq(clubMemberships.clubId, clubId)));

  if (!member || !member.members.lichessUsername) {
    throw new Error("Mitglied nicht gefunden oder kein Lichess-Benutzername hinterlegt");
  }

  const profile = await fetchLichessProfile(member.members.lichessUsername);
  if (!profile) {
    throw new Error("Lichess-Profil konnte nicht abgerufen werden");
  }

  const newElo = getBestLichessRating(profile);
  if (newElo === null) {
    throw new Error("Keine relevanten Ratings auf Lichess gefunden");
  }

  // Update member ELO
  await db
    .update(members)
    .set({ elo: newElo })
    .where(eq(members.id, memberId));

  // Add history entry
  await db.insert(dwzHistory).values({
    memberId,
    dwz: member.members.dwz ?? 0,
    elo: newElo,
    source: "lichess-sync",
    recordedAt: new Date().toISOString().split("T")[0],
  });

  revalidatePath(`/dashboard/members/${memberId}`);
  return { success: true, newElo };
}
