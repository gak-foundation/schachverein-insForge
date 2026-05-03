"use client";

import { Suspense, useState, useActionState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { loginAction, initiateOAuthAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { SocialButtons } from "@/features/auth/components/social-buttons";
import { ErrorMessage } from "@/features/auth/components/error-message";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <AuthCard>
            <div className="space-y-6 animate-pulse">
              <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-11 w-full rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-11 w-full rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </AuthCard>
        </AuthLayout>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("invitation");
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const callbackURL = invitationToken 
    ? `/auth/invitation?token=${invitationToken}`
    : redirectPath;

  const loginFormAction = async (_prevState: { error: string } | null, formData: FormData) => {
    return loginAction(formData);
  };
  const [error, formAction, isPending] = useActionState(loginFormAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthPending, startOAuth] = useTransition();

  function initiateOAuth(provider: string) {
    startOAuth(async () => {
      const formData = new FormData();
      formData.append("provider", provider);
      formData.append("redirectTo", callbackURL);
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
          title="Willkommen zurück"
          subtitle="Melden Sie sich an, um Ihren Schachverein zu verwalten"
        />

        <div className="mt-8">
          <form action={formAction} className="space-y-5" suppressHydrationWarning>
            <input type="hidden" name="redirect" value={callbackURL} />

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
              {isPending ? "Wird angemeldet..." : "Anmelden"}
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
