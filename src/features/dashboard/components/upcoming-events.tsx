import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  startDate: Date;
};

type UpcomingEventsProps = {
  events: Event[];
  emptyMessage?: string;
  emptyHref?: string;
  emptyLabel?: string;
};

export function UpcomingEvents({ events, emptyMessage = "Keine Termine geplant.", emptyHref = "/dashboard/calendar/new", emptyLabel = "Termin anlegen" }: UpcomingEventsProps) {
  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Events</CardTitle>
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Kommende Termine</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="rounded-lg border border-dashed py-8 text-center">
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              <Link href={emptyHref} className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
                {emptyLabel}
              </Link>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">{event.title}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {new Date(event.startDate).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
