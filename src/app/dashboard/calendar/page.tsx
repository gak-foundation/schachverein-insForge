import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getCalendarEvents } from "@/features/calendar/actions";
import CalendarGrid from "@/features/calendar/components/CalendarGrid";
import { startOfYear, endOfYear } from "date-fns";

export const metadata = {
  title: "Veranstaltungskalender",
};

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const canWrite = hasPermission(
    session.user.role ?? "mitglied",
    session.user.permissions ?? [],
    PERMISSIONS.EVENTS_WRITE);

  // Fetch events for the current year to have enough data for navigation
  const now = new Date();
  const start = startOfYear(now);
  const end = endOfYear(now);

  const allEvents = await getCalendarEvents(start, end);

  return (
    <div className="space-y-6 h-full">
      <CalendarGrid initialEvents={allEvents} canWrite={canWrite} />
    </div>
  );
}
