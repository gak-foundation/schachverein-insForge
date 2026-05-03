"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Repeat,
  CalendarPlus,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { de } from "date-fns/locale";
import { CalendarItem } from "@/types";

const eventTypeColors: Record<string, string> = {
  training: "bg-green-100 text-green-800 border-green-200",
  match: "bg-blue-100 text-blue-800 border-blue-200",
  tournament: "bg-purple-100 text-purple-800 border-purple-200",
  meeting: "bg-yellow-100 text-yellow-800 border-yellow-200",
  other: "bg-gray-100 text-gray-800 border-gray-200",
};

interface CalendarGridProps {
  initialEvents: CalendarItem[];
  canWrite: boolean;
}

export default function CalendarGrid({ initialEvents, canWrite }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const events = initialEvents;

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: de })}
          </h2>
          <div className="flex items-center border rounded-md">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevMonth}
              aria-label="Vorheriger Monat"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-gray-200" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextMonth}
              aria-label="Nächster Monat"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Heute
          </Button>
        </div>
        {canWrite && (
          <Link href="/dashboard/calendar/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Neues Event
            </Button>
          </Link>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = "/dashboard/calendar/ical";
              window.open(url, "_blank");
            }}
            title="Gesamten Kalender abonnieren"
          >
            <CalendarPlus className="h-4 w-4 mr-1" />
            Abonnieren
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-l">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium border-r border-b bg-gray-50 text-gray-500"
          >
            {day}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const dayEvents = events.filter((event) => isSameDay(event.start, day));
          
          return (
            <div
              key={i}
              className={`min-h-[120px] p-2 border-r border-b transition-colors ${
                !isSameMonth(day, monthStart) ? "bg-gray-50/50" : "bg-white"
              } ${isToday(day) ? "bg-blue-50/30" : ""}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${
                    isToday(day) ? "bg-blue-600 text-white" : "text-gray-700"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map((event) => (
                  <Link
                    key={event.id}
                    href={event.originalId ? `/dashboard/calendar/${event.originalId}/edit` : `/dashboard/calendar/${event.id}/edit`}
                    className={`block px-2 py-1 text-xs rounded border truncate hover:brightness-95 transition-all ${
                      eventTypeColors[event.type] || "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {event.isRecurring && <Repeat className="h-3 w-3 inline" />}
                      {!event.isAllDay && (
                        <span className="font-semibold">
                          {format(event.start, "HH:mm")}
                        </span>
                      )}
                      <span>{event.title}</span>
                    </div>
                  </Link>
                ))}
                {dayEvents.length > 4 && (
                  <div className="text-[10px] text-gray-500 pl-1">
                    + {dayEvents.length - 4} weitere
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
