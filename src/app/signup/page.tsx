"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PASSWORD_REQUIREMENTS = [
  { test: (p: string) => p.length >= 8, label: "Mindestens 8 Zeichen" },
  { test: (p: string) => /[A-Z]/.test(p), label: "Ein Großbuchstabe" },
  { test: (p: string) => /[a-z]/.test(p), label: "Ein Kleinbuchstabe" },
  { test: (p: string) => /[0-9]/.test(p), label: "Eine Ziffer" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "Ein Sonderzeichen" },
];

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const { registerUser } = await import("@/lib/actions");
      await registerUser(formData);
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-5xl">♔</div>
          <CardTitle className="text-2xl">Registrieren</CardTitle>
          <CardDescription>
            Erstellen Sie ein Konto für die Vereinsverwaltung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Max Mustermann"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@verein.de"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password && (
                <div className="mt-1 space-y-0.5">
                  {PASSWORD_REQUIREMENTS.map((req) => (
                    <p
                      key={req.label}
                      className={`text-xs ${
                        req.test(password) ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {req.test(password) ? "✓" : "○"} {req.label}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrieren..." : "Registrieren"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Bereits ein Konto?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}