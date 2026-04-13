import { z } from "zod";

export const createTournamentSchema = z.object({
  name: z.string().min(1, "Turniername ist erforderlich").max(300),
  type: z.enum([
    "swiss",
    "round_robin",
    "rapid",
    "blitz",
    "team_match",
    "club_championship",
  ]),
  seasonId: z.string().uuid().optional(),
  startDate: z.string().date(),
  endDate: z.string().date().optional().or(z.literal("")),
  location: z.string().max(300).optional(),
  timeControl: z.string().max(50).optional(),
  numberOfRounds: z.coerce.number().int().min(1).max(20).optional(),
  description: z.string().optional(),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
