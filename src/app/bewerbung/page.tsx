import { Metadata } from "next";
import { WaitlistApplicationForm } from "./waitlist-form";

export const metadata: Metadata = {
  title: "Verein bewerben - Schachstudio",
  description: "Bewirb dich als Schachverein für Schachstudio",
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
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

          <div className="bg-card rounded-xl border p-8">
            <WaitlistApplicationForm />
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