"use server";

import { db } from "@/lib/db";
import { members, clubMemberships, memberStatusHistory } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { parseMemberCSV, exportMembersToCSV } from "@/lib/csv/members";
import { createMemberSchema } from "@/lib/validations/member";
import { requireClubId } from "./utils";
import { getSession } from "@/lib/auth/session";

export async function importMembersCSV(formData: FormData) {
  const clubId = await requireClubId();
  const session = await getSession();
  const csvData = formData.get("csvData") as string;
  const invitedBy = (formData.get("invitedBy") as string) || "system";

  if (!csvData) {
    return {
      success: false,
      imported: 0,
      errors: [{ row: 0, message: "CSV-Daten fehlen" }],
    };
  }

  const parsed = parseMemberCSV(csvData);
  const results = {
    success: 0,
    errors: parsed.errors.map((e) => `Zeile ${e.row}: ${e.message}`),
  };

  for (const memberData of parsed.data) {
    try {
      // Validate with Zod
      const validated = createMemberSchema.parse({
        ...memberData,
        role: memberData.role || "mitglied",
        status: memberData.status || "active",
      });

      const email = validated.email;

      const [existing] = await db
        .select({ id: members.id, status: members.status })
        .from(members)
        .where(eq(members.email, email));

      let memberId: string;

      if (existing) {
        memberId = existing.id;
        
        // Record status change if it changed during import/update
        if (validated.status !== existing.status) {
          await db.insert(memberStatusHistory).values({
            memberId,
            oldStatus: existing.status,
            newStatus: validated.status as "active" | "inactive" | "resigned" | "honorary",
            reason: "Status durch CSV-Import aktualisiert",
            changedBy: session?.user.memberId ?? null,
          });
        }

        await db
          .update(members)
          .set({
            firstName: validated.firstName,
            lastName: validated.lastName,
            phone: validated.phone || null,
            dwz: validated.dwz || null,
            status: validated.status as typeof members.$inferInsert.status,
            updatedAt: new Date(),
          })
          .where(eq(members.id, memberId));
      } else {
        const [member] = await db
          .insert(members)
          .values({
            firstName: validated.firstName,
            lastName: validated.lastName,
            email: email,
            phone: validated.phone || null,
            dwz: validated.dwz || null,
            status: validated.status as typeof members.$inferInsert.status,
            role: "mitglied", // Default base role
          })
          .returning();
        memberId = member.id;

        // Record initial status
        await db.insert(memberStatusHistory).values({
          memberId,
          newStatus: validated.status as "active" | "inactive" | "resigned" | "honorary",
          reason: "Mitglied durch CSV-Import angelegt",
          changedBy: session?.user.memberId ?? null,
        });
      }

      const [existingMembership] = await db
        .select()
        .from(clubMemberships)
        .where(
          and(
            eq(clubMemberships.memberId, memberId),
            eq(clubMemberships.clubId, clubId),
          ),
        );

      if (!existingMembership) {
        await db.insert(clubMemberships).values({
          clubId,
          memberId,
          role: (validated.role as any) || "mitglied",
          invitedBy,
        });
      } else if (validated.role) {
         await db
          .update(clubMemberships)
          .set({ role: validated.role as any })
          .where(
            and(
              eq(clubMemberships.memberId, memberId),
              eq(clubMemberships.clubId, clubId),
            ),
          );
      }

      results.success++;
    } catch (error) {
      const email = memberData.email || "unbekannt";
      results.errors.push(
        `${email}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  revalidatePath("/dashboard/members");
  return {
    success: results.success > 0,
    imported: results.success,
    errors: results.errors.map((e: string, i: number) => ({
      row: i + 1,
      message: e,
    })),
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
