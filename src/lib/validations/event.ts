import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(300),
  description: z.string().optional(),
  eventType: z.enum(["training", "match", "tournament", "meeting", "other"]),
  startDate: z.string().min(1, "Startdatum ist erforderlich"),
  endDate: z.string().optional(),
  location: z.string().max(300).optional(),
  isAllDay: z.boolean().default(false),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
