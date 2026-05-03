"use server";

import { createServiceClient } from "@/lib/insforge";
import { requireClubAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function saveNavigation(pageIds: string[]) {
  const session = await requireClubAuth();
  const client = createServiceClient();

  const { error } = await client
    .from("clubs")
    .update({ navigation_pages: pageIds })
    .eq("id", session.user.clubId);

  if (error) throw new Error("Fehler beim Speichern der Navigation: " + error.message);
  revalidatePath("/dashboard/pages");
  return { success: true };
}

export async function getNavigation(clubId: string): Promise<string[]> {
  const client = createServiceClient();
  const { data } = await client
    .from("clubs")
    .select("navigation_pages")
    .eq("id", clubId)
    .maybeSingle();

  return (data as any)?.navigation_pages ?? [];
}
