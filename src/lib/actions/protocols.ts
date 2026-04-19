"use server";

import { db } from "@/lib/db";
import { meetingProtocols, events } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { logMemberAction } from "@/lib/audit";
import { PERMISSIONS, hasPermission } from "@/lib/auth/permissions";

/**
 * Initializes a new protocol for a meeting event.
 */
export async function createProtocol(eventId: string) {
  const session = await getSession();
  if (!session) throw new Error("Nicht autorisiert");

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) throw new Error("Event nicht gefunden");

  const [newProtocol] = await db.insert(meetingProtocols).values({
    clubId: event.clubId,
    eventId: event.id,
    title: `Protokoll: ${event.title}`,
    location: event.location,
    startTime: event.startDate,
    endTime: event.endDate,
    agenda: [],
  }).returning();

  await logMemberAction("CREATED", newProtocol.id, { entity: "meeting_protocol" });
  
  revalidatePath("/dashboard/protocols");
  return newProtocol;
}

/**
 * Updates protocol content (agenda, resolutions, etc.).
 */
export async function updateProtocol(id: string, data: any) {
  const session = await getSession();
  if (!session) throw new Error("Nicht autorisiert");

  // Check if protocol is already signed
  const [existing] = await db.select().from(meetingProtocols).where(eq(meetingProtocols.id, id));
  if (existing?.signedAt) {
    throw new Error("Ein bereits signiertes Protokoll kann nicht mehr bearbeitet werden.");
  }

  await db.update(meetingProtocols)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(meetingProtocols.id, id));

  revalidatePath(`/dashboard/protocols/${id}`);
  return { success: true };
}

/**
 * Signs the protocol, making it legally immutable within the system.
 */
export async function signProtocol(id: string) {
  const session = await getSession();
  if (!session || !session.user.memberId) throw new Error("Nicht autorisiert");

  // RBAC: Only Vorstand or Admins should sign
  const canSign = hasPermission(
    session.user.role ?? "mitglied",
    session.user.permissions ?? [],
    PERMISSIONS.ADMIN_AUDIT // Using this as proxy for now, ideally BOARD_SIGN
  );

  if (!canSign) throw new Error("Keine Berechtigung zum Signieren von Protokollen.");

  await db.update(meetingProtocols)
    .set({
      signedAt: new Date(),
      signedBy: session.user.memberId,
      updatedAt: new Date(),
    })
    .where(eq(meetingProtocols.id, id));

  await logMemberAction("UPDATED", id, { action: "SIGNED_PROTOCOL" });

  revalidatePath(`/dashboard/protocols/${id}`);
  return { success: true };
}

export async function getProtocols() {
  return await db.query.meetingProtocols.findMany({
    with: {
      event: true,
      signer: true,
    },
    orderBy: (protocols, { desc }) => [desc(protocols.createdAt)],
  });
}

export async function getProtocolById(id: string) {
  return await db.query.meetingProtocols.findFirst({
    where: eq(meetingProtocols.id, id),
    with: {
      event: true,
      signer: true,
    },
  });
}
