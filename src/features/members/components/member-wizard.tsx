"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createMemberSchema, type CreateMemberInput } from "@/lib/validations/member";
import { createMember } from "@/features/members/actions";
import { MemberWizardStep, WizardProgress } from "./member-wizard-step";
import { Loader2, ChevronLeft } from "lucide-react";

interface MemberWizardProps {
  contributionRates?: any[];
}

const STORAGE_KEY = "member-wizard-draft";

export function MemberWizard({ contributionRates = [] }: MemberWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  const form = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      role: "mitglied",
      status: "active",
      contributionRateId: undefined,
      photoConsent: false,
      newsletterConsent: false,
      resultPublicationConsent: true,
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const draft = sessionStorage.getItem(STORAGE_KEY);
      if (draft) {
        setShowDraftPrompt(true);
      }
    }
  }, []);

  const loadDraft = () => {
    if (typeof window !== "undefined") {
      const draft = sessionStorage.getItem(STORAGE_KEY);
      if (draft) {
        const data = JSON.parse(draft);
        Object.entries(data).forEach(([key, value]) => {
          form.setValue(key as any, value as any);
        });
        setShowDraftPrompt(false);
      }
    }
  };

  const discardDraft = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setShowDraftPrompt(false);
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const values = form.watch();

  function goToStep(step: number) {
    if (step > currentStep) {
      const fieldsToValidate = getFieldsForStep(currentStep);
      const isValid = fieldsToValidate.every((field) => !form.getFieldState(field as any).invalid);
      if (!isValid) {
        form.trigger(fieldsToValidate as any);
        return;
      }
    }
    setCurrentStep(step);
  }

  function getFieldsForStep(step: number): string[] {
    switch (step) {
      case 1:
        return ["firstName", "lastName", "email"];
      case 2:
        return ["role", "status"];
      default:
        return [];
    }
  }

  function onSubmit() {
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        await createMember(formData);

        if (typeof window !== "undefined") {
          sessionStorage.removeItem(STORAGE_KEY);
        }

        toast({ title: "Erfolg", description: "Mitglied erfolgreich angelegt" });
        router.push("/dashboard/members");
      } catch (error) {
        toast({
          title: "Fehler",
          description: "Fehler beim Anlegen",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      {showDraftPrompt && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800 mb-3">
            Sie haben einen nicht gespeicherten Entwurf. Moechten Sie ihn fortsetzen?
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={loadDraft}>
              Entwurf laden
            </Button>
            <Button size="sm" variant="outline" onClick={discardDraft}>
              Verwerfen
            </Button>
          </div>
        </div>
      )}

      <WizardProgress currentStep={currentStep} totalSteps={3} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === 3) {
            onSubmit();
          }
        }}
        className="space-y-8"
      >
        <MemberWizardStep step={1} currentStep={currentStep} title="Persoenliche Daten">
          <div className="bg-card rounded-xl border border-border/60 p-6 shadow-sm space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Vorname *</Label>
                <Input id="firstName" {...form.register("firstName")} placeholder="Max" />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Nachname *</Label>
                <Input id="lastName" {...form.register("lastName")} placeholder="Mustermann" />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">E-Mail *</Label>
                <Input id="email" type="email" {...form.register("email")} placeholder="max@beispiel.de" />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" type="tel" {...form.register("phone")} placeholder="+49 123 456789" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
                <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} />
              </div>
              <div>
                <Label htmlFor="gender">Geschlecht</Label>
                <Select onValueChange={(v) => form.setValue("gender", v)} value={values.gender || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Waehlen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maennlich">Maennlich</SelectItem>
                    <SelectItem value="weiblich">Weiblich</SelectItem>
                    <SelectItem value="divers">Divers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </MemberWizardStep>

        <MemberWizardStep step={2} currentStep={currentStep} title="Status & Beitrag">
          <div className="bg-card rounded-xl border border-border/60 p-6 shadow-sm space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="role">Rolle im System</Label>
                <Select onValueChange={(v) => form.setValue("role", v)} value={values.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Waehlen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mitglied">Mitglied</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="spielleiter">Spielleiter</SelectItem>
                    <SelectItem value="jugendwart">Jugendwart</SelectItem>
                    <SelectItem value="kassenwart">Kassenwart</SelectItem>
                    <SelectItem value="vorstand">Vorstand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Mitgliedsstatus</Label>
                <Select onValueChange={(v) => form.setValue("status", v)} value={values.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Waehlen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                    <SelectItem value="honorary">Ehrenmitglied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="contributionRateId">Beitragsstufe</Label>
              <Select
                onValueChange={(v) => form.setValue("contributionRateId", v)}
                value={values.contributionRateId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Keine Beitragsstufe gewaehlt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Beitragsstufe</SelectItem>
                  {contributionRates.map((rate) => (
                    <SelectItem key={rate.id} value={rate.id}>
                      {rate.name} ({Number(rate.amount).toFixed(2)} EUR)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </MemberWizardStep>

        <MemberWizardStep step={3} currentStep={currentStep} title="Zusammenfassung">
          <div className="bg-card rounded-xl border border-border/60 p-6 shadow-sm space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Ueberpruefen Sie die Daten
              </h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{values.firstName} {values.lastName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">E-Mail</span>
                  <span className="font-medium">{values.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Telefon</span>
                  <span className="font-medium">{values.phone || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Rolle</span>
                  <span className="font-medium capitalize">{values.role}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{values.status}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="sendInvitation"
                checked={true}
                onCheckedChange={() => {}}
              />
              <div>
                <Label htmlFor="sendInvitation" className="cursor-pointer">
                  Automatische E-Mail-Einladung senden
                </Label>
                <p className="text-xs text-muted-foreground">
                  Das Mitglied erhaelt eine Einladung mit Login-Daten
                </p>
              </div>
            </div>
          </div>
        </MemberWizardStep>

        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => goToStep(currentStep - 1)}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Zurueck
            </Button>
          )}
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={() => goToStep(currentStep + 1)}
              className="ml-auto"
            >
              Weiter
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="ml-auto min-w-[160px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Mitglied anlegen"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
