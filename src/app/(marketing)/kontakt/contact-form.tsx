"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitContactForm, type SubmitContactFormResult } from "@/lib/actions/contact";
import { AlertCircle, CheckCircle } from "lucide-react";

export function ContactForm() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitContactFormResult | null>(null);

  const defaultType = searchParams.get("type") as
    | "waitlist"
    | "contact"
    | null;

  const typeLabels: Record<string, string> = {
    waitlist: "Warteliste",
    contact: "Allgemeine Anfrage",
  };

  async function handleSubmit(formData: FormData) {
    formData.append("source", searchParams.get("utm_source") || "direct");
    formData.append("userAgent", navigator.userAgent);

    startTransition(async () => {
      const response = await submitContactForm(formData);
      setResult(response);
    });
  }

  if (result && "success" in result && result.success) {
    return (
      <div className="p-8 text-center rounded-xl bg-green-50 border border-green-200">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-900 mb-2">
          Anfrage erfolgreich gesendet!
        </h3>
        <p className="text-green-700">
          Vielen Dank für Ihre Nachricht. Wir werden uns so schnell wie möglich bei
          Ihnen melden.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {result && "error" in result && !result.fieldErrors && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{result.error}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Anfragetyp *</Label>
          <Select name="type" defaultValue={defaultType || "contact"} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(typeLabels) as Array<keyof typeof typeLabels>).map(
                (key) => (
                  <SelectItem key={key} value={key}>{typeLabels[key]}</SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          {result?.fieldErrors?.type && (
            <p className="text-sm text-red-600">{result.fieldErrors.type[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="memberCount">Mitgliederzahl</Label>
          <Input
            id="memberCount"
            name="memberCount"
            type="number"
            min={1}
            placeholder="z.B. 50"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clubName">Vereinsname *</Label>
          <Input
            id="clubName"
            name="clubName"
            required
            minLength={2}
            maxLength={200}
            placeholder="SC Beispiel e.V."
          />
          {result?.fieldErrors?.clubName && (
            <p className="text-sm text-red-600">{result.fieldErrors.clubName[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Ihr Name *</Label>
          <Input
            id="contactName"
            name="contactName"
            required
            minLength={2}
            maxLength={200}
            placeholder="Max Mustermann"
          />
          {result?.fieldErrors?.contactName && (
            <p className="text-sm text-red-600">{result.fieldErrors.contactName[0]}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={255}
            placeholder="vorstand@verein.de"
          />
          {result?.fieldErrors?.email && (
            <p className="text-sm text-red-600">{result.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            maxLength={50}
            placeholder="+49 123 456789"
          />
          {result?.fieldErrors?.phone && (
            <p className="text-sm text-red-600">{result.fieldErrors.phone[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Nachricht</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Wie können wir Ihnen helfen?"
        />
        {result?.fieldErrors?.message && (
          <p className="text-sm text-red-600">{result.fieldErrors.message[0]}</p>
        )}
      </div>

      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Wird gesendet..." : "Anfrage senden"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Mit dem Absenden stimmen Sie unserer{" "}
        <a href="/datenschutz" className="underline">Datenschutzerklärung</a> zu.
      </p>
    </form>
  );
}
