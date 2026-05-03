// src/lib/ical/generator.ts
export interface ICalEvent {
  uid: string;
  dtstart: string; // ISO 8601 date string
  dtend: string;
  summary: string;
  description?: string;
  location?: string;
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatDate(dateStr: string): string {
  // Converts ISO 8601 to iCal DTSTART/DTEND format: YYYYMMDDTHHMMSS
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

export function generateSingleEvent(event: ICalEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Schachverein//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTART:${formatDate(event.dtstart)}`,
    `DTEND:${formatDate(event.dtend)}`,
    `SUMMARY:${escapeText(event.summary)}`,
  ];
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function generateCalendarFeed(
  events: ICalEvent[],
  calendarName: string
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Schachverein//DE",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "X-WR-CALDESC:Schachverein Eventkalender",
  ];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTART:${formatDate(event.dtstart)}`,
      `DTEND:${formatDate(event.dtend)}`,
      `SUMMARY:${escapeText(event.summary)}`,
      event.description ? `DESCRIPTION:${escapeText(event.description)}` : null,
      event.location ? `LOCATION:${escapeText(event.location)}` : null,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}
