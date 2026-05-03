export const events = "events" as const;

export interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string | null;
  eventType: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  isAllDay: boolean | null;
  recurrenceRule: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface NewEvent {
  id?: string;
  clubId: string;
  title: string;
  description?: string | null;
  eventType: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  isAllDay?: boolean | null;
  recurrenceRule?: string | null;
  createdBy?: string | null;
  createdAt?: string;
}
