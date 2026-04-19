"use server";

import { db } from "@/lib/db";
import { clubs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireClubId } from "./utils";

export async function getClubBankSettings() {
  const clubId = await requireClubId();

  const [club] = await db
    .select({
      creditorId: clubs.creditorId,
      sepaIban: clubs.sepaIban,
      sepaBic: clubs.sepaBic,
    })
    .from(clubs)
    .where(eq(clubs.id, clubId));

  return {
    creditorId: club?.creditorId || "",
    sepaIban: club?.sepaIban || "",
    sepaBic: club?.sepaBic || "",
  };
}

export async function updateClubBankSettings(formData: FormData) {
  const clubId = await requireClubId();

  const creditorId = formData.get("creditorId") as string;
  const sepaIban = formData.get("sepaIban") as string;
  const sepaBic = formData.get("sepaBic") as string;

  await db
    .update(clubs)
    .set({
      creditorId,
      sepaIban,
      sepaBic,
    })
    .where(eq(clubs.id, clubId));

  // revalidatePath is not needed if we use server actions with useFormStatus or similar
}
