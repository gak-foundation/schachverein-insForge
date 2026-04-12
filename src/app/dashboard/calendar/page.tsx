import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getEvents } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const eventTypeLabels: Record<string, string> = {
  training: "Training",
  match: "Mannschaftskampf",
  tournament: "Turnier",
  meeting: "Versammlung",
  other: "Sonstiges",
};

const eventTypeColors: Record<string, string> = {
  training: "bg-green-100 text-green-800",
  match: "bg-blue-100 text-blue-800",
  tournament: "bg-purple-100 text-purple-800",
  meeting: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-800",
};

export const metadata = {
  title: "Kalender",
};

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const canWrite = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.EVENTS_WRITE);
  const allEvents = await getEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kalender</h1>
          <p className="text-sm text-gray-500">
            {allEvents.length} Veranstaltungen
          </p>
        </div>
        {canWrite && (
          <Link href="/dashboard/calendar/new">
            <Button>Neues Event</Button>
          </Link>
        )}
      </div>

      {allEvents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Veranstaltungen. Klicke auf &ldquo;Neues Event&rdquo; um zu beginnen.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Alle Veranstaltungen</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Ort</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${eventTypeColors[event.eventType] ?? "bg-gray-100"}`}>
                        {eventTypeLabels[event.eventType] ?? event.eventType}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(event.startDate).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-gray-500">{event.location ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}