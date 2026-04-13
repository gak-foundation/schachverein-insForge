import { z } from "zod";

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

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
