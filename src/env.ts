import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("Muss eine gültige URL sein"),
  REDIS_URL: z.string().url().optional(), // Optional since the app tries to fallback, but should be set in prod
  NEXT_PUBLIC_APP_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32, "Auth Secret muss mindestens 32 Zeichen lang sein"),
  BETTER_AUTH_URL: z.string().url(),
  ENCRYPTION_KEY: z.string().optional(),
});

// Parsen der Umgebungsvariablen. Wirft einen Fehler (mit Exit Code 1), wenn etwas fehlt.
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Ungültige Umgebungsvariablen:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
