"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { ErrorMessage } from "@/features/auth/components/error-message";

import { createClient } from "@/lib/insforge";

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

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const supabase = createClient();

  const strength = calculateStrength(password);

  useEffect(() => {
    // The session is handled automatically via URL params
    // Wir müssen hier nichts weiter tun
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein");
      return;
    }

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben");
      return;
    }

    setLoading(true);

    try {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Invalid reset token');
        return;
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Password reset failed');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthHeader
        title={success ? "Passwort geändert" : "Passwort zurücksetzen"}
        subtitle={success ? "Ihr neues Passwort wurde gespeichert" : "Erstellen Sie ein neues sicheres Passwort"}
      />

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="password" title="Neues Passwort" className="text-sm font-medium text-slate-200">Neues Passwort</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Neues Passwort"
                    required
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
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Passwort verbergen" : "Passwort anzeigen"}</span>
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
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword" title="Passwort bestätigen" className="text-sm font-medium text-slate-200">Passwort bestätigen</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Passwort wiederholen"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}</span>
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
                  {loading ? "Wird gespeichert..." : "Passwort speichern"}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <Link
                href="/auth/login"
                className="text-xs text-slate-500 transition-colors hover:text-slate-300"
              >
                ← Zurück zur Anmeldung
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
            >
              <CheckCircle className="h-8 w-8 text-green-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <p className="text-slate-300">
                Ihr Passwort wurde erfolgreich zurückgesetzt.
              </p>
              <p className="text-sm text-slate-500">
                Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => router.push("/auth/login")}
                className="h-12 w-full bg-gradient-to-r from-blue-600 to-violet-600 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-violet-500 hover:shadow-blue-500/40"
              >
                Zum Login
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-8 w-8 text-blue-400" />
      </motion.div>
      <p className="mt-4 text-sm text-slate-400">Wird geladen...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <Suspense fallback={<LoadingState />}>
          <ResetPasswordContent />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
