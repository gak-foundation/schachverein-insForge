"use server";

import { getEventById as originalGetEventById, updateEvent as originalUpdateEvent } from "@/features/calendar/actions";

export async function getEventById(id: string) {
  return originalGetEventById(id);
}

export async function updateEvent(id: string, data: any) {
  return originalUpdateEvent(id, data);
}
