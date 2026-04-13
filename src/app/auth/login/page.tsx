"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { SocialButtons } from "@/components/auth/social-buttons";
import { ErrorMessage } from "@/components/auth/error-message";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Ungültige E-Mail oder Passwort",
  email_not_verified: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse",
  account_locked: "Ihr Account ist vorübergehend gesperrt",
  rate_limited: "Zu viele Anfragen. Bitte versuchen Sie es später erneut",
  default: "Ein Fehler ist aufgetreten",
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        const errorMessage = result.error.message || result.error;
        if (typeof errorMessage === "string") {
          const lower = errorMessage.toLowerCase();
          if (lower.includes("credential") || lower.includes("passwort") || lower.includes("ungültig")) {
            setError(ERROR_MESSAGES.invalid_credentials);
          } else if (lower.includes("verifiziert") || lower.includes("verify")) {
            setError(ERROR_MESSAGES.email_not_verified);
          } else if (lower.includes("gesperrt") || lower.includes("locked")) {
            setError(ERROR_MESSAGES.account_locked);
          } else if (lower.includes("rate") || lower.includes("zu viele")) {
            setError(ERROR_MESSAGES.rate_limited);
          } else {
            setError(errorMessage);
          }
        } else {
          setError(ERROR_MESSAGES.default);
        }
      }
    } catch {
      setError(ERROR_MESSAGES.default);
    } finally {
      setLoading(false);
    }
  }

  async function handleGithubSignIn() {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Willkommen zurück"
          subtitle="Melden Sie sich an, um Ihren Schachverein zu verwalten"
        />

        <div className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-200">
                E-Mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@verein.de"
                required
                autoComplete="email"
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  Passwort
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ihr Passwort"
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <ErrorMessage message={error} onDismiss={() => setError(null)} />
            )}

            <Button
              type="submit"
              className="h-11 w-full font-medium"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </Button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                Oder weiter mit
              </span>
            </div>
          </div>

          <div className="mt-6">
            <SocialButtons onGithubClick={handleGithubSignIn} />
          </div>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Noch kein Konto?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Registrieren
            </Link>
          </p>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
