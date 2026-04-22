import { Metadata } from "next";
import { WaitlistApplicationForm } from "./waitlist-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verein bewerben | schach.studio",
  description: "Bewirb dich als einer der ersten Vereine für schach.studio und profitiere von exklusiven Vorteilen.",
  alternates: {
    canonical: "/bewerbung",
  },
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl border p-8">
            <Suspense fallback={<div className="h-[600px] flex items-center justify-center">Laden...</div>}>
              <WaitlistApplicationForm />
            </Suspense>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Bereits registriert?</p>
            <a href="/auth/login" className="text-primary hover:underline">
              Zum Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}