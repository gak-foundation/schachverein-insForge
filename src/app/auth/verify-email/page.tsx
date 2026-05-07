"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Mail, ArrowLeft, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyEmailAction } from "@/features/auth/actions";
import { toast } from "@/components/ui/use-toast";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const isDev = searchParams.get("dev") === "true";

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("code", code);

      const result = await verifyEmailAction(formData);
      if ((result as any)?.success) {
        setIsVerified(true);
        setTimeout(() => router.push("/onboarding"), 1500);
      } else {
        toast({
          title: "Fehler",
          description: (result as any)?.error || "Code ungultig oder abgelaufen",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Fehler", description: "Verifizierung fehlgeschlagen", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {isVerified ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <Mail className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isVerified ? "E-Mail bestatigt!" : "E-Mail bestatigen"}
          </CardTitle>
          <CardDescription>
            {isVerified
              ? "Du wirst weitergeleitet..."
              : "Gib den 6-stelligen Code aus der E-Mail ein"}
          </CardDescription>
        </CardHeader>

        {!isVerified && (
          <>
            <CardContent className="space-y-6">
              {email && (
                <p className="text-center text-sm text-muted-foreground">
                  Code gesendet an: <span className="font-medium text-foreground">{email}</span>
                </p>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Bestatigungscode</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    className="h-12 text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isVerifying || code.length !== 6}>
                  {isVerifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isVerifying ? "Wird bestatigt..." : "Bestatigen"}
                </Button>
              </form>

              {isDev && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                    <Bug className="h-4 w-4" />
                    Entwicklungsmodus
                  </div>
                  <p className="text-xs text-amber-700">
                    Kein E-Mail-Versand konfiguriert. Der Bestatigungscode wird in der Server-Konsole angezeigt.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={async () => {
                      for (const otp of ["000000", "123456"]) {
                        const fd = new FormData();
                        fd.append("email", email);
                        fd.append("code", otp);
                        const result = await verifyEmailAction(fd);
                        if ((result as any)?.success) {
                          setIsVerified(true);
                          setTimeout(() => router.push("/onboarding"), 1500);
                          return;
                        }
                      }
                      toast({
                        title: "Dev-Mode",
                        description: "Kein Standard-Code funktioniert. Prufe die Server-Konsole auf den echten Code.",
                      });
                    }}
                  >
                    Auto-Verify (Dev)
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <p className="text-xs text-center text-muted-foreground">
                Der Code ist 24 Stunden gultig. Uberprufe auch den Spam-Ordner.
              </p>
              <Button variant="link" size="sm" onClick={() => router.push("/auth/login")} className="text-xs">
                <ArrowLeft className="mr-1 h-3 w-3" />
                Zuruck zur Anmeldung
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

function VerifyEmailSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center space-y-4 animate-pulse">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto" />
          <div className="h-6 w-48 rounded bg-muted mx-auto" />
          <div className="h-4 w-64 rounded bg-muted mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
