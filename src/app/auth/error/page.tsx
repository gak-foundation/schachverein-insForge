"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { createClient } from "@/lib/insforge";

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<ErrorSkeleton />}>
      <ErrorContent />
    </Suspense>
  );
}

function ErrorSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4 animate-pulse">
        <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto" />
        <div className="h-8 w-64 rounded bg-slate-200 dark:bg-slate-700 mx-auto" />
        <div className="h-4 w-96 rounded bg-slate-200 dark:bg-slate-700 mx-auto" />
      </div>
    </div>
  );
}

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const content = getErrorContent(reason);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {content.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {content.description}
          </p>
        </div>

        <div className="space-y-3">
          {content.actions.map((action, i) =>
            action.href ? (
              <Link
                key={i}
                href={action.href}
                className="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {action.icon}
                {action.label}
              </Link>
            ) : (
              <button
                key={i}
                className="inline-flex items-center justify-center w-full rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function getErrorContent(reason: string | null) {
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  switch (reason) {
    case "wrong_tenant":
      return {
        title: "Falscher Verein",
        description:
          "Dieser Account gehört zu einem anderen Verein. Bitte melden Sie sich unter Ihrer Vereins-Subdomain an.",
        actions: [
          {
            label: "Zur Startseite",
            href: "/",
            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
          },
          {
            label: "Abmelden",
            icon: <LogOut className="mr-2 h-4 w-4" />,
            onClick: handleLogout,
            variant: "outline" as const,
          },
        ],
      };

    case "too_many_redirects":
      return {
        title: "Weiterleitungsfehler",
        description:
          "Es ist ein Fehler bei der Anmeldung aufgetreten. Bitte versuchen Sie es erneut oder wenden Sie sich an den Support.",
        actions: [
          {
            label: "Zur Startseite",
            href: "/",
            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
          },
          {
            label: "Abmelden",
            icon: <LogOut className="mr-2 h-4 w-4" />,
            onClick: handleLogout,
            variant: "outline" as const,
          },
        ],
      };

    case "no_club":
      return {
        title: "Kein Verein zugeordnet",
        description:
          "Ihr Account ist noch keinem Verein zugeordnet. Bitte wenden Sie sich an Ihren Administrator.",
        actions: [
          {
            label: "Zur Startseite",
            href: "/",
            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
          },
          {
            label: "Abmelden",
            icon: <LogOut className="mr-2 h-4 w-4" />,
            onClick: handleLogout,
            variant: "outline" as const,
          },
        ],
      };

    default:
      return {
        title: "Ein Fehler ist aufgetreten",
        description:
          "Bei der Anmeldung ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.",
        actions: [
          {
            label: "Zur Startseite",
            href: "/",
            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
          },
          {
            label: "Abmelden",
            icon: <LogOut className="mr-2 h-4 w-4" />,
            onClick: handleLogout,
            variant: "outline" as const,
          },
        ],
      };
  }
}
