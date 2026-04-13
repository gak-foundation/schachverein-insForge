import { z } from "zod";

export const createSeasonSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100),
  year: z.coerce.number().int().min(2000).max(2100),
  type: z.enum(["bundesliga", "bezirksliga", "kreisklasse", "club_internal"]).default("club_internal"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
