import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { members } from "@/lib/db/schema/members";

export const memberSchema = createSelectSchema(members);

export const createMemberSchema = createInsertSchema(members, {
  firstName: z.string().min(1, "Vorname ist erforderlich").max(100),
  lastName: z.string().min(1, "Nachname ist erforderlich").max(100),
  email: z.string().email("Ungueltige E-Mail-Adresse"),
  phone: z.string().max(50).optional().nullable(),
  dateOfBirth: z.string().date().optional().nullable().or(z.literal("")),
  gender: z.string().max(20).optional().nullable(),
  dwz: z.coerce.number().int().min(0).max(3000).optional().nullable(),
  elo: z.coerce.number().int().min(0).max(3500).optional().nullable(),
  dwzId: z.string().max(50).optional().nullable(),
  lichessUsername: z.string().max(100).optional().nullable(),
  chesscomUsername: z.string().max(100).optional().nullable(),
  sepaMandateReference: z.string().max(35).optional().nullable(),
  sepaIban: z.string().max(1024).optional().nullable(),
  sepaBic: z.string().max(1024).optional().nullable(),
  mandateSignedAt: z.string().date().optional().nullable().or(z.literal("")),
  mandateUrl: z.string().url().max(1000).optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletionRequestedAt: true,
  anonymizedAt: true,
  heritageGameId: true,
}).extend({
  role: z.enum([
    "admin",
    "vorstand",
    "sportwart",
    "jugendwart",
    "kassenwart",
    "trainer",
    "mitglied",
    "eltern",
    "user",
  ]).default("mitglied"),
});

export const updateMemberSchema = createMemberSchema.partial();

export type Member = z.infer<typeof memberSchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
