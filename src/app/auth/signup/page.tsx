"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { ErrorMessage } from "@/components/auth/error-message";
import { authClient } from "@/lib/auth/client";

const PASSWORD_REQUIREMENTS = [
  { test: (p: string) => p.length >= 8, label: "Mindestens 8 Zeichen" },
  { test: (p: string) => /[A-Z]/.test(p), label: "Ein Großbuchstabe" },
  { test: (p: string) => /[a-z]/.test(p), label: "Ein Kleinbuchstabe" },
  { test: (p: string) => /[0-9]/.test(p), label: "Eine Ziffer" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "Ein Sonderzeichen" },
];

function calculateStrength(password: string): number {
  if (!password) return 0;
  const passed = PASSWORD_REQUIREMENTS.filter((r) => r.test(password)).length;
  return (passed / PASSWORD_REQUIREMENTS.length) * 100;
}

function getStrengthColor(strength: number): string {
  if (strength < 40) return "bg-red-500";
  if (strength < 60) return "bg-orange-500";
  if (strength < 80) return "bg-yellow-500";
  return "bg-green-500";
}

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = calculateStrength(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const passwordValue = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (passwordValue !== confirmPassword) {
      setError("Passwoerter stimmen nicht ueberein");
      setLoading(false);
      return;
    }

    try {
      const { error } = await authClient.signUp.email({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: passwordValue,
      });

      if (error) {
        throw new Error(error.message ?? "Registrierung fehlgeschlagen");
      }

      router.push("/auth/verify-request");
    } catch (e) {
      if (e instanceof Error && e.message === "NEXT_REDIRECT") {
        router.push("/auth/verify-request");
        return;
      }
      setError(e instanceof Error ? e.message : "Registrierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Konto erstellen"
          subtitle="Werden Sie Teil Ihres Schachvereins"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="name" className="text-sm font-medium text-slate-200">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Max Mustermann"
              required
              autoComplete="name"
              autoFocus
              className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
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
              className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <Label htmlFor="password" className="text-sm font-medium text-slate-200">
              Passwort
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sicheres Passwort"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 pr-12"
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

            {password && (
              <div className="space-y-2 pt-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(strength)}`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {PASSWORD_REQUIREMENTS.map((req) => (
                    <p
                      key={req.label}
                      className={`text-xs ${
                        req.test(password) ? "text-green-400" : "text-slate-500"
                      }`}
                    >
                      {req.test(password) ? "✓" : "○"} {req.label}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200">
              Passwort bestätigen
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Passwort wiederholen"
                required
                autoComplete="new-password"
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
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
            transition={{ delay: 0.6 }}
          >
            <Button
              type="submit"
              className="h-12 w-full bg-gradient-to-r from-blue-600 to-violet-600 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-violet-500 hover:shadow-blue-500/40 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Wird registriert..." : "Konto erstellen"}
            </Button>
          </motion.div>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center text-sm text-slate-400"
        >
          Bereits ein Konto?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            Anmelden
          </Link>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
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
