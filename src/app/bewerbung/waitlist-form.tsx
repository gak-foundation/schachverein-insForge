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
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "waitlist" | "pilot") || "waitlist";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    message?: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setResult(null);

    // Ensure type is included in formData
    formData.set("type", type);

    const response = await submitWaitlistApplication(formData);

    if (response.success) {
      setResult({
        success: true,
        message: response.message || "Bewerbung erfolgreich eingereicht!",
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
        <h2 className="text-2xl font-bold mb-4">Bewerbung eingereicht!</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {result.message ||
            "Wir haben Ihre Bewerbung erhalten und werden uns in Kürze bei Ihnen melden."}
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
          <span className="text-3xl">{type === "pilot" ? "🚀" : "♔"}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          {type === "pilot"
            ? "Als Pilotverein bewerben"
            : "Verein auf Warteliste setzen"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {type === "pilot"
            ? "Sichern Sie sich exklusive Vorteile und gestalten Sie die Zukunft der Vereinsverwaltung mit."
            : "Wir nehmen derzeit neue Vereine auf. Füllen Sie das Formular aus und wir melden uns bei Ihnen."}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {result?.error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {result.error}
          </div>
        )}

        {type === "pilot" && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Info className="h-4 w-4" />
              <span>Pilot-Programm Vorteile</span>
            </div>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>1 Jahr komplett kostenlos (statt 108 €)</li>
              <li>Persönlicher Support (WhatsApp & 2x mtl. 30 Min. Call)</li>
              <li>Lebenslang 50% Rabatt auf alle Pläne</li>
              <li>Direkter Einfluss auf die Feature-Roadmap</li>
            </ul>
          </div>
        )}

        <input type="hidden" name="type" value={type} />

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

      {type === "pilot" && (
        <div className="space-y-2">
          <label htmlFor="painPoints" className="text-sm font-medium">
            Aktuelle Schmerzpunkte <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="painPoints"
            name="painPoints"
            required={type === "pilot"}
            placeholder="Was stört euch aktuell am meisten? (z.B. zu viel Excel, veraltetes WordPress, Papierkram...)"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="memberCount" className="text-sm font-medium">
            Anzahl Mitglieder {type === "pilot" && <span className="text-red-500">*</span>}
          </label>
          <Input
            id="memberCount"
            name="memberCount"
            type="text"
            required={type === "pilot"}
            maxLength={50}
            placeholder="z.B. 45"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            Stadt
          </label>
          <Input
            id="city"
            name="city"
            type="text"
            maxLength={100}
            placeholder="Musterstadt"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Zusätzliche Anmerkungen
        </label>
        <Textarea
          id="notes"
          name="notes"
          maxLength={1000}
          placeholder="Weitere Informationen zu Ihrem Verein..."
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {type === "pilot" && (
        <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
          <Checkbox id="terms" name="terms" required disabled={isSubmitting} />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Verpflichtung zur Mitarbeit
            </label>
            <p className="text-xs text-muted-foreground">
              Wir erklären uns bereit, aktiv Feedback zu geben und an 2x monatlichen
              Support-Calls (ca. 30 Min.) teilzunehmen.
            </p>
          </div>
        </div>
      )}

      <div className="pt-4">
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gesendet...
            </>
          ) : type === "pilot" ? (
            "Jetzt als Pilotverein bewerben"
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