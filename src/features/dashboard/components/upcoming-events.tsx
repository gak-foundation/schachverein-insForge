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
    <div className="py-8 border-b border-border/40">
      <div className="mb-6">
        <h2 className="text-2xl font-heading tracking-tight">Events</h2>
        <p className="text-sm text-muted-foreground mt-1">Kommende Termine</p>
      </div>
      <div className="space-y-0">
        {events.length === 0 ? (
          <div className="py-8">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            <Link href={emptyHref} className="mt-2 text-sm font-semibold hover:text-primary transition-colors uppercase tracking-widest border-b border-foreground inline-block pb-1">
              {emptyLabel}
            </Link>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="py-4 border-b border-border/20 last:border-0 flex items-start justify-between group">
              <p className="text-lg font-heading tracking-tight group-hover:text-primary transition-colors">{event.title}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">
                {new Date(event.startDate).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
