import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getEventById, getCalendarEvents } from "@/features/calendar/actions";
import { generateSingleEvent, generateCalendarFeed } from "@/lib/ical/generator";
import { startOfYear, endOfYear } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (eventId) {
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const ical = generateSingleEvent({
      uid: `${event.id}@schachverein`,
      dtstart: event.startDate ?? event.start_date,
      dtend: event.endDate ?? event.end_date ?? event.startDate ?? event.start_date,
      summary: event.title,
      description: event.description ?? "",
      location: event.location ?? "",
    });

    const filename = `${event.title.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, "_")}.ics`;
    return new NextResponse(ical, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // Full calendar feed
  const now = new Date();
  const start = startOfYear(now);
  const end = endOfYear(now);
  const events = await getCalendarEvents(start, end);

  const ical = generateCalendarFeed(
    events.map((e: any) => ({
      uid: `${e.id}@schachverein`,
      dtstart: e.start?.toISOString() ?? e.startDate ?? e.start_date,
      dtend: e.end?.toISOString() ?? e.endDate ?? e.end_date ?? e.start?.toISOString() ?? e.startDate ?? e.start_date,
      summary: e.title,
      description: e.description ?? "",
      location: e.location ?? "",
    })),
    "Schachverein Kalender"
  );

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="schachverein.ics"',
    },
  });
}
