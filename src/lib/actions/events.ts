"use server";

import { db } from "@/lib/db";
import { events, seasons } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireClubId } from "./utils";

export async function getEvents(limit?: number) {
  const clubId = await requireClubId();

  let query = db
    .select({
      id: events.id,
      title: events.title,
      eventType: events.eventType,
      startDate: events.startDate,
      endDate: events.endDate,
      location: events.location,
      isAllDay: events.isAllDay,
    })
    .from(events)
    .where(eq(events.clubId, clubId))
    .orderBy(desc(events.startDate));

  if (limit) {
    query = query.limit(limit) as typeof query;
  }

  return query;
}

export async function createEvent(formData: FormData) {
  const clubId = await requireClubId();

  const title = formData.get("title") as string;
  const eventType = formData.get("eventType") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const isAllDay = formData.get("isAllDay") === "true";

  await db.insert(events).values({
    clubId,
    title,
    eventType,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    location,
    isAllDay,
  });

  revalidatePath("/dashboard/calendar");
}

export async function getSeasons() {
  const clubId = await requireClubId();

  return db
    .select()
    .from(seasons)
    .where(eq(seasons.clubId, clubId))
    .orderBy(desc(seasons.year));
}

export async function createSeason(formData: FormData) {
  const clubId = await requireClubId();

  const name = formData.get("name") as string;
  const year = Number(formData.get("year"));
  const type = (formData.get("type") as string) || "club_internal";
  const startDate = (formData.get("startDate") as string) || null;
  const endDate = (formData.get("endDate") as string) || null;

  await db.insert(seasons).values({
    clubId,
    name,
    year,
    type: type as any,
    startDate,
    endDate,
  });

  revalidatePath("/dashboard/seasons");
}
