"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { SocialButtons } from "@/features/auth/components/social-buttons";
import { ErrorMessage } from "@/features/auth/components/error-message";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const supabase = createClient();

  const passwordStrength = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strengthCount = Object.values(passwordStrength).filter(Boolean).length;
  const strengthColor = 
    strengthCount <= 1 ? "bg-red-500" :
    strengthCount <= 3 ? "bg-amber-500" : 
    "bg-green-500";

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // Extract subdomain slug for tenant binding
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "schach.studio";
    let slug = "";
    if (hostname.endsWith(`.${rootDomain}`)) {
      const parts = hostname.split(".");
      if (parts.length > rootDomain.split(".").length) {
        slug = parts.slice(0, -rootDomain.split(".").length).join(".");
      }
    }

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        slug,
      });

      if (error) {
        setError(error.message || "Ein Fehler ist aufgetreten");
      } else if (data?.user) {
        // Bind user to tenant immediately after Supabase signup
        if (slug) {
          try {
            await fetch("/api/auth/bind-tenant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: data.user.id,
                email,
                name,
                slug,
              }),
            });
          } catch (bindError: any) {
            console.error("Tenant binding error:", bindError?.message);
          }
        }
        router.push("/auth/verify-email");
      } else {
        router.push("/auth/verify-email");
      }
    } catch {
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  async function handleGithubSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Konto erstellen"
          subtitle="Werden Sie Teil Ihres Schachvereins"
        />

        <div className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-900 dark:text-slate-200">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Ihr Name"
                required
                autoComplete="name"
                className="h-11"
              />
            </div>

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
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-slate-200">
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strengthColor} transition-all duration-300`} 
                      style={{ width: `${(strengthCount / 4) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span className={passwordStrength.length ? "text-green-600" : ""}>8+ Zeichen</span>
                    <span className={passwordStrength.capital ? "text-green-600" : ""}>Großbuchstabe</span>
                    <span className={passwordStrength.number ? "text-green-600" : ""}>Zahl</span>
                    <span className={passwordStrength.special ? "text-green-600" : ""}>Sonderzeichen</span>
                  </div>
                </div>
              )}
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
              {loading ? "Wird erstellt..." : "Konto erstellen"}
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
            Haben Sie bereits ein Konto?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Anmelden
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
