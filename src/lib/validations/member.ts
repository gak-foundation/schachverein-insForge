import { z } from "zod";

export const createMemberSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich").max(100),
  lastName: z.string().min(1, "Nachname ist erforderlich").max(100),
  email: z.string().email("Ungueltige E-Mail-Adresse"),
  phone: z.string().max(50).optional(),
  dateOfBirth: z.string().date().optional().or(z.literal("")),
  gender: z.enum(["maennlich", "weiblich", "divers", "keine_angabe"]).optional(),
  dwz: z.coerce.number().int().min(0).max(3000).optional(),
  elo: z.coerce.number().int().min(0).max(3500).optional(),
  dwzId: z.string().max(50).optional(),
  lichessUsername: z.string().max(100).optional(),
  chesscomUsername: z.string().max(100).optional(),
  role: z.enum([
    "admin",
    "vorstand",
    "sportwart",
    "jugendwart",
    "kassenwart",
    "trainer",
    "mitglied",
    "eltern",
  ]).default("mitglied"),
  status: z.enum(["active", "inactive", "resigned", "honorary"]).default("active"),
  parentId: z.string().uuid().optional(),
  photoConsent: z.boolean().default(false),
  newsletterConsent: z.boolean().default(false),
  resultPublicationConsent: z.boolean().default(true),
  notes: z.string().optional(),
  sepaMandateReference: z.string().max(35).optional(),
  sepaIban: z.string().max(34).optional(),
  sepaBic: z.string().max(11).optional(),
});

export const updateMemberSchema = createMemberSchema.partial();

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
