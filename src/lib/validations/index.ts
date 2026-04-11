import { z } from "zod";

// ─── Member Schemas ────────────────────────────────────────────

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

// ─── Auth Schemas ──────────────────────────────────────────────

export const passwordSchema = z
  .string()
  .min(8, "Mindestens 8 Zeichen")
  .regex(/[A-Z]/, "Mindestens ein Großbuchstabe")
  .regex(/[a-z]/, "Mindestens ein Kleinbuchstabe")
  .regex(/[0-9]/, "Mindestens eine Ziffer")
  .regex(/[^A-Za-z0-9]/, "Mindestens ein Sonderzeichen");

export const loginSchema = z.object({
  email: z.string().email("Ungueltige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name ist erforderlich"),
  email: z.string().email("Ungueltige E-Mail-Adresse"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwoerter stimmen nicht ueberein",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Ungueltige E-Mail-Adresse"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token ist erforderlich"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwoerter stimmen nicht ueberein",
  path: ["confirmPassword"],
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token ist erforderlich"),
});

// ─── Team Schemas ──────────────────────────────────────────────

export const createTeamSchema = z.object({
  name: z.string().min(1, "Teamname ist erforderlich").max(200),
  seasonId: z.string().uuid(),
  league: z.string().max(200).optional(),
  captainId: z.string().uuid().optional(),
});

// ─── Tournament Schemas ─────────────────────────────────────────

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

// ─── Event Schemas ──────────────────────────────────────────────

export const createEventSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(300),
  description: z.string().optional(),
  eventType: z.enum(["training", "match", "tournament", "meeting", "other"]),
  startDate: z.string().min(1, "Startdatum ist erforderlich"),
  endDate: z.string().optional(),
  location: z.string().max(300).optional(),
  isAllDay: z.boolean().default(false),
});

// ─── Season Schemas ──────────────────────────────────────────────

export const createSeasonSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100),
  year: z.coerce.number().int().min(2000).max(2100),
  type: z.enum(["bundesliga", "bezirksliga", "kreisklasse", "club_internal"]).default("club_internal"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ─── User Role Schemas ─────────────────────────────────────────

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

// ─── Type Exports ──────────────────────────────────────────────

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;