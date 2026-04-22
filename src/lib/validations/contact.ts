import { z } from "zod";

export const contactFormSchema = z.object({
  type: z.enum(["waitlist", "contact", "pilot"], {
    message: "Bitte wählen Sie einen Anfragetyp",
  }),
  clubName: z
    .string()
    .min(2, "Der Vereinsname muss mindestens 2 Zeichen lang sein")
    .max(200, "Der Vereinsname darf maximal 200 Zeichen lang sein"),
  contactName: z
    .string()
    .min(2, "Der Name muss mindestens 2 Zeichen lang sein")
    .max(200, "Der Name darf maximal 200 Zeichen lang sein"),
  email: z
    .string()
    .email("Bitte geben Sie eine gültige E-Mail-Adresse ein")
    .max(255, "Die E-Mail-Adresse ist zu lang"),
  phone: z
    .string()
    .max(50, "Die Telefonnummer ist zu lang")
    .optional()
    .or(z.literal("")),
  memberCount: z.coerce
    .number()
    .min(1, "Die Mitgliederzahl muss mindestens 1 sein")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .max(2000, "Die Nachricht darf maximal 2000 Zeichen lang sein")
    .optional()
    .or(z.literal("")),
  website: z.string().max(300).optional().or(z.literal("")),
  turnstileToken: z.string({
    message: "Bitte bestätigen Sie, dass Sie kein Roboter sind.",
  }),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
