"use client";

import { useState, useActionState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signupAction, initiateOAuthAction } from "@/features/auth/actions";
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
  const signupFormAction = async (_prevState: { error: string } | null, formData: FormData) => {
    return signupAction(formData);
  };
  const [error, formAction, isPending] = useActionState(signupFormAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [oauthPending, startOAuth] = useTransition();

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

  function initiateOAuth(provider: string) {
    startOAuth(async () => {
      const formData = new FormData();
      formData.append("provider", provider);
      formData.append("redirectTo", "/onboarding");
      formData.append("origin", window.location.origin);
      const result = await initiateOAuthAction(formData);
      if ((result as any)?.url) {
        window.location.href = (result as any).url;
      }
    });
  }

  function buildOAuthProvider(provider: "github" | "google") {
    return {
      id: provider,
      onClick: () => initiateOAuth(provider),
    };
  }

  const oauthProviders = [buildOAuthProvider("google"), buildOAuthProvider("github")];

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Konto erstellen"
          subtitle="Registrieren Sie sich und richten Sie Ihren Schachverein ein"
        />

        <div className="mt-8">
          <form action={formAction} className="space-y-4" suppressHydrationWarning>
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

            {error?.error && (
              <ErrorMessage message={error.error} onDismiss={() => {}} />
            )}

            <Button
              type="submit"
              className="h-11 w-full font-medium"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isPending ? "Wird erstellt..." : "Konto erstellen"}
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
            <SocialButtons providers={oauthProviders} />
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
