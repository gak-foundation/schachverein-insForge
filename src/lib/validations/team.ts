import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "Teamname ist erforderlich").max(200),
  seasonId: z.string().uuid(),
  league: z.string().max(200).optional(),
  captainId: z.string().uuid().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
