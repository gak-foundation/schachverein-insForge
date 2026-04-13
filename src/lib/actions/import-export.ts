"use server";

import { db } from "@/lib/db";
import { members, clubMemberships, tournaments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { parseMemberCSV, exportMembersToCSV } from "@/lib/csv/members";
import { requireClubId } from "./utils";

export async function importMembersCSV(formData: FormData) {
  const clubId = await requireClubId();
  const csvData = formData.get("csvData") as string;
  const invitedBy = formData.get("invitedBy") as string || "system";

  if (!csvData) {
    return { success: false, imported: 0, errors: [{ row: 0, message: "CSV-Daten fehlen" }] };
  }

  const parsed = parseMemberCSV(csvData);
  const results = { success: 0, errors: parsed.errors.map(e => `Zeile ${e.row}: ${e.message}`) };

  for (const memberData of parsed.data) {
    const email = memberData.email;
    if (!email) continue;

    const firstName = memberData.firstName;
    const lastName = memberData.lastName;
    if (!firstName || !lastName) {
      results.errors.push(`${email}: Vor- und Nachname sind erforderlich`);
      continue;
    }

    try {
      const [existing] = await db
        .select({ id: members.id })
        .from(members)
        .where(eq(members.email, email));

      let memberId: string;

      if (existing) {
        memberId = existing.id;
        await db
          .update(members)
          .set({
            firstName: firstName,
            lastName: lastName,
            phone: memberData.phone || null,
            dwz: memberData.dwz || null,
          })
          .where(eq(members.id, memberId));
      } else {
        const [member] = await db
          .insert(members)
          .values({
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: memberData.phone || null,
            dwz: memberData.dwz || null,
            status: "active",
            role: "mitglied",
          })
          .returning();
        memberId = member.id;
      }

      const [existingMembership] = await db
        .select()
        .from(clubMemberships)
        .where(and(
          eq(clubMemberships.memberId, memberId),
          eq(clubMemberships.clubId, clubId)
        ));

      if (!existingMembership) {
        const role = memberData.role as "admin" | "vorstand" | "sportwart" | "jugendwart" | "kassenwart" | "trainer" | "mitglied" | "eltern" | undefined;
        await db.insert(clubMemberships).values({
          clubId,
          memberId,
          role: role || "mitglied",
          invitedBy,
        });
      }

      results.success++;
    } catch (error) {
      const email = memberData.email || "unknown";
      results.errors.push(`${email}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  revalidatePath("/dashboard/members");
  return {
    success: results.success > 0,
    imported: results.success,
    errors: results.errors.map((e: string, i: number) => ({ row: i + 1, message: e })),
  };
}

export async function exportMembersToCSVAction() {
  const clubId = await requireClubId();

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
    })
    .from(clubMemberships)
    .innerJoin(members, eq(clubMemberships.memberId, members.id))
    .where(eq(clubMemberships.clubId, clubId));

  return exportMembersToCSV(membersList);
}
