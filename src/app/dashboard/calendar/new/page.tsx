import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Neues Event",
};

export default async function NewEventPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/calendar" className="text-gray-500 hover:text-gray-700">
          &larr; Zurueck
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Neues Event</h1>
      </div>

      <form action={createEvent} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Event-Details</CardTitle>
            <CardDescription>Erstelle eine neue Veranstaltung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input id="title" name="title" required placeholder="z.B. Training Dienstag" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">Typ *</Label>
              <select
                id="eventType"
                name="eventType"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="training">Training</option>
                <option value="match">Mannschaftskampf</option>
                <option value="tournament">Turnier</option>
                <option value="meeting">Versammlung</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Beginn *</Label>
                <Input id="startDate" name="startDate" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ende</Label>
                <Input id="endDate" name="endDate" type="datetime-local" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input id="location" name="location" placeholder="z.B. Vereinsheim" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400"
                placeholder="Details zur Veranstaltung..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAllDay"
                name="isAllDay"
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isAllDay">Ganztags</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/calendar">
            <Button variant="outline" type="button">Abbrechen</Button>
          </Link>
          <Button type="submit">Event anlegen</Button>
        </div>
      </form>
    </div>
  );
}