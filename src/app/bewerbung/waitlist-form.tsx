"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitWaitlistApplication } from "@/lib/actions/waitlist";
import { Checkbox } from "@/components/ui/checkbox";

export function WaitlistApplicationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    message?: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setResult(null);

    // Default to waitlist type
    formData.set("type", "waitlist");

    const response = await submitWaitlistApplication(formData);

    if (response.success) {
      setResult({
        success: true,
        message: response.message || "Eintrag erfolgreich!",
      });
    } else {
      setResult({
        error: response.error || "Ein Fehler ist aufgetreten",
      });
    }

    setIsSubmitting(false);
  }

  if (result?.success) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Eintrag erfolgreich!</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {result.message ||
            "Wir haben Ihren Eintrag erhalten und werden uns in Kürze bei Ihnen melden."}
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            Zur Startseite
          </Button>
          <Button onClick={() => router.push("/auth/signup")}>
            Account erstellen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
          <span className="text-3xl">♔</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Verein auf Warteliste setzen
        </h1>
        <p className="text-muted-foreground text-lg">
          Wir nehmen derzeit neue Vereine auf. Füllen Sie das Formular aus und wir melden uns bei Ihnen.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {result?.error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {result.error}
          </div>
        )}

        <input type="hidden" name="type" value="waitlist" />


      <div className="space-y-2">
        <label htmlFor="clubName" className="text-sm font-medium">
          Vereinsname <span className="text-red-500">*</span>
        </label>
        <Input
          id="clubName"
          name="clubName"
          type="text"
          required
          minLength={2}
          maxLength={200}
          placeholder="z.B. Schachverein Musterstadt"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="contactEmail" className="text-sm font-medium">
            Kontakt-E-Mail <span className="text-red-500">*</span>
          </label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            minLength={5}
            maxLength={255}
            placeholder="vorstand@verein.de"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="contactName" className="text-sm font-medium">
            Ansprechpartner
          </label>
          <Input
            id="contactName"
            name="contactName"
            type="text"
            maxLength={255}
            placeholder="Max Mustermann"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="website" className="text-sm font-medium">
          Vereinswebsite
        </label>
        <Input
          id="website"
          name="website"
          type="url"
          maxLength={300}
          placeholder="https://www.verein.de"
          disabled={isSubmitting}
        />
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gesendet...
            </>
          ) : (
            "Auf die Warteliste setzen"
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu.
      </p>
      </form>
      </div>
      );
      }