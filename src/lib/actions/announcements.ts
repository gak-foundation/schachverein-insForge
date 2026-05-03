"use server";

import { createServiceClient } from "@/lib/insforge";
import { requireClubAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(formData: FormData) {
  const session = await requireClubAuth();
  const client = createServiceClient();

  const { error } = await client.from("announcements").insert({
    club_id: session.user.clubId,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    type: (formData.get("type") as string) || "info",
    valid_until: formData.get("validUntil") || null,
  });

  if (error) throw new Error("Fehler beim Erstellen der Ankündigung: " + error.message);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getActiveAnnouncements(clubId: string) {
  const client = createServiceClient();
  const { data } = await client
    .from("announcements")
    .select("*")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);

  return (data || []) as any[];
}

export async function deactivateAnnouncement(id: string) {
  const session = await requireClubAuth();
  const client = createServiceClient();
  const { error } = await client
    .from("announcements")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error("Fehler beim Deaktivieren: " + error.message);
  revalidatePath("/dashboard");
  return { success: true };
}
