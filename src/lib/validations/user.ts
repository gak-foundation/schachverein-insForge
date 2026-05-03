import { z } from "zod";

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum([
    "admin",
    "vorstand",
    "spielleiter",
    "jugendwart",
    "kassenwart",
    "trainer",
    "mitglied",
    "eltern",
    "user",
  ]),
  permissions: z.array(z.string()).default([]),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
