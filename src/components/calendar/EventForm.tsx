"use client";

import { useState } from "react";
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
import { RRule } from "rrule";
import { Trash2 } from "lucide-react";
import { deleteEvent } from "@/lib/actions/events";
import { useRouter } from "next/navigation";

interface EventFormProps {
  initialData?: {
    id: string;
    title: string;
    eventType: string;
    startDate: Date | string | null;
    endDate: Date | string | null;
    location: string | null;
    description: string | null;
    isAllDay: boolean;
    recurrenceRule: string | null;
  } | any;
  action: (formData: FormData) => Promise<void>;
  title: string;
  submitLabel: string;
}

export default function EventForm({ 
  initialData, 
  action, 
  title, 
  submitLabel 
}: EventFormProps) {
  const router = useRouter();
  const [isRecurring, setIsRecurring] = useState(!!initialData?.recurrenceRule);

  const handleDelete = async () => {
    if (confirm("Möchtest du diese Veranstaltung wirklich löschen?")) {
      await deleteEvent(initialData.id);
      router.push("/dashboard/calendar");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (isRecurring) {
      const startDate = new Date(formData.get("startDate") as string);
      const rule = new RRule({
        freq: RRule.WEEKLY,
        dtstart: startDate,
        byweekday: [startDate.getDay() === 0 ? RRule.SU : startDate.getDay() - 1],
      });
      formData.set("recurrenceRule", rule.toString());
    } else {
      formData.delete("recurrenceRule");
    }

    await action(formData);
    router.push("/dashboard/calendar");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/calendar" className="text-gray-500 hover:text-gray-700">
            &larr; Zurück
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        {initialData && (
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Event-Details</CardTitle>
            <CardDescription>Verwalte die Informationen der Veranstaltung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input 
                id="title" 
                name="title" 
                required 
                defaultValue={initialData?.title}
                placeholder="z.B. Training Dienstag" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">Typ *</Label>
              <select
                id="eventType"
                name="eventType"
                defaultValue={initialData?.eventType || "training"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="datetime-local" 
                  required 
                  defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ende</Label>
                <Input 
                  id="endDate" 
                  name="endDate" 
                  type="datetime-local" 
                  defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input 
                id="location" 
                name="location" 
                defaultValue={initialData?.location}
                placeholder="z.B. Vereinsheim" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={initialData?.description}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Details zur Veranstaltung..."
              />
            </div>
            
            <div className="pt-2 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAllDay"
                  name="isAllDay"
                  defaultChecked={initialData?.isAllDay}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isAllDay">Ganztags</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isRecurring">Wiederkehrendes Event</Label>
              </div>

              {isRecurring && (
                <div className="p-3 bg-gray-50 rounded-md border text-sm text-gray-600">
                  Dieses Event wird <strong>wöchentlich</strong> am selben Wochentag wie der Beginn wiederholt.
                  <input type="hidden" name="recurrenceRule" value="DUMMY" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/calendar">
            <Button variant="outline" type="button">Abbrechen</Button>
          </Link>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </div>
  );
}
