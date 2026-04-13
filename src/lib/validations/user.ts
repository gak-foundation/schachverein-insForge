import { z } from "zod";

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum([
    "admin",
    "vorstand",
    "sportwart",
    "jugendwart",
    "kassenwart",
    "trainer",
    "mitglied",
    "eltern",
  ]),
  permissions: z.array(z.string()).default([]),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
