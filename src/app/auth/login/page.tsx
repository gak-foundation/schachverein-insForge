"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
        const errorCode = result.error.code ?? "default";
        setError(ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.default);
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="email" className="text-sm font-medium text-slate-200">
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
              className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                Passwort
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-blue-400 transition-colors hover:text-blue-300"
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
                className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <ErrorMessage message={error} onDismiss={() => setError(null)} />
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="submit"
              className="h-12 w-full bg-gradient-to-r from-blue-600 to-violet-600 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-violet-500 hover:shadow-blue-500/40 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </Button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-950 px-3 text-slate-400">oder</span>
            </div>
          </div>

          <div className="mt-6">
            <SocialButtons onGithubClick={handleGithubSignIn} />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-sm text-slate-400"
        >
          Noch kein Konto?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            Registrieren
          </Link>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <Link
            href="/"
            className="text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            ← Zurück zur Startseite
          </Link>
        </motion.div>
      </AuthCard>
    </AuthLayout>
  );
}
