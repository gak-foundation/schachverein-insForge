import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("Muss eine gültige URL sein"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  // Supabase Auth
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  // Optional: Email SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  // Encryption for sensitive data
  ENCRYPTION_KEY: z.string().optional(),
  BBP_PAIRINGS_CONTAINER: z.string().default("schachverein-pairings"),
  BBP_TEMP_DIR: z.string().default("/tmp/bbp-pairings"),
});

// Parsen der Umgebungsvariablen. Wirft einen Fehler (mit Exit Code 1), wenn etwas fehlt.
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Ungültige Umgebungsvariablen:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
