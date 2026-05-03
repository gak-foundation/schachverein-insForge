"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const HONEYPOT_LOAD_TIME = Date.now();

export function ContactFormBlock({ data, mode }: { data: any; blockId: string; mode: string }) {
  const [submitted, setSubmitted] = useState(false);
  const showPhone = data.showPhoneField === true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const honeypot = formData.get("website") as string;
    if (honeypot) {
      // Bot detected - silently succeed (don't let bots know they were caught)
      setSubmitted(true);
      return;
    }

    const loadTime = parseInt(formData.get("_loadtime") as string || "0", 10);
    const elapsed = (Date.now() - loadTime) / 1000;
    if (elapsed < 3) {
      // Submission too fast - likely bot, silently succeed
      setSubmitted(true);
      return;
    }

    setSubmitted(true);
  };

  if (submitted && mode !== "editor") {
    return (
      <div className="max-w-lg mx-auto p-6 border rounded-lg shadow-sm text-center space-y-3 bg-muted/30">
        <h3 className="text-xl font-semibold">{data.successMessage || "Vielen Dank! Ihre Nachricht wurde gesendet."}</h3>
        <p className="text-sm text-muted-foreground">Wir melden uns in Kürze bei Ihnen.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 border rounded-lg shadow-sm space-y-4 bg-muted/30">
      <h3 className="text-xl font-semibold mb-4">{data.title || "Kontakt aufnehmen"}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot - unsichtbar für Menschen, aber Bots füllen es aus */}
        <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
          <Label htmlFor={`hp-${data.blockId || "cf"}`}>Website</Label>
          <Input
            id={`hp-${data.blockId || "cf"}`}
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        {/* Time trap */}
        <input type="hidden" name="_loadtime" value={HONEYPOT_LOAD_TIME} />

        <div className="space-y-2">
          <Label htmlFor="cf-name">Name *</Label>
          <Input
            id="cf-name"
            name="name"
            placeholder="Ihr Name"
            required
            disabled={mode === "editor"}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cf-email">E-Mail *</Label>
          <Input
            id="cf-email"
            name="email"
            type="email"
            placeholder="ihre@mail.de"
            required
            disabled={mode === "editor"}
            autoComplete="email"
          />
        </div>
        {showPhone && (
          <div className="space-y-2">
            <Label htmlFor="cf-phone">Telefon</Label>
            <Input
              id="cf-phone"
              name="phone"
              type="tel"
              placeholder="+49 123 456789"
              disabled={mode === "editor"}
              autoComplete="tel"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="cf-message">Nachricht *</Label>
          <Textarea
            id="cf-message"
            name="message"
            placeholder="Ihre Nachricht..."
            required
            disabled={mode === "editor"}
            rows={4}
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="cf-dsgvo"
            name="dsgvo"
            required
            disabled={mode === "editor"}
            className="mt-1 rounded"
          />
          <Label htmlFor="cf-dsgvo" className="text-xs text-muted-foreground">
            Ich stimme der Verarbeitung meiner Daten zum Zweck der Kontaktaufnahme zu.{" "}
            <a href="/datenschutz" className="underline" target="_blank" rel="noopener noreferrer">
              Datenschutzerklärung
            </a>
          </Label>
        </div>
        <Button type="submit" className="w-full" disabled={mode === "editor"}>
          {data.submitButtonLabel || "Nachricht senden"}
        </Button>
      </form>
    </div>
  );
}
