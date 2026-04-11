import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { getPublicEvents } from "@/lib/public-actions";

export const metadata = {
  title: "Termine",
};

export default async function EventsPage() {
  const events = await getPublicEvents();

  const eventTypeLabels: Record<string, string> = {
    training: "Training",
    match: "Mannschaftsspiel",
    tournament: "Turnier",
    meeting: "Versammlung",
    other: "Sonstiges",
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Termine</h1>
        <p className="text-lg text-gray-600 mb-12">
          Hier finden Sie alle kommenden Termine unseres Vereins – 
          von Trainings über Turniere bis hin zu Versammlungen.
        </p>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Keine Termine</h2>
            <p className="text-gray-500">Aktuell sind keine Termine geplant.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const startDate = new Date(event.startDate);
              const endDate = event.endDate ? new Date(event.endDate) : null;

              return (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center text-blue-900">
                          <span className="text-xs font-semibold uppercase">
                            {startDate.toLocaleDateString("de-DE", { month: "short" })}
                          </span>
                          <span className="text-2xl font-bold">{startDate.getDate()}</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold">{event.title}</h2>
                          <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {eventTypeLabels[event.eventType] || event.eventType}
                          </span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {!event.isAllDay && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {startDate.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                            {endDate && ` - ${endDate.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`}
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-gray-600 mt-2">{event.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
