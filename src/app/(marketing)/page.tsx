import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Wallet } from "lucide-react";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { ProblemSolutionSection } from "@/components/marketing/problem-solution-section";
import { PilotProjectSection } from "@/components/marketing/pilot-project-section";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { MiniManager } from "@/components/marketing/mini-manager";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Alles was dein Verein braucht</h2>
            <p className="text-muted-foreground">
              Entwickelt von Schachspielern für Schachvereine. Wir kennen eure Abläufe.
            </p>
          </div>
          <div className="max-w-5xl mx-auto mb-16">
            <div className="relative rounded-2xl overflow-hidden border shadow-2xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl blur opacity-20" />
              <div className="relative bg-card">
                <MiniManager />
              </div>
            </div>
          </div>
          <FeatureGrid />
        </div>
      </section>

      <ProblemSolutionSection />

      <PilotProjectSection />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                <Shield className="h-3.5 w-3.5" />
                <span>Barrierefreiheit</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Bereit für die BFSG</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Das Barrierefreiheitsstärkungsgesetz (BFSG) verpflichtet Vereine ab einer bestimmten Größe,
                digitale Angebote barrierefrei zugänglich zu machen. Wir haben das schon für Sie erledigt.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-card border">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2">WCAG 2.2 AA</h3>
                <p className="text-sm text-muted-foreground">
                  Vollständig umgesetzt nach den Web Content Accessibility Guidelines.
                  Tastaturbedienbar, ausreichender Kontrast, klare Sprache.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Keine Extra-Kosten</h3>
                <p className="text-sm text-muted-foreground">
                  Barrierefreiheit ist bei uns keine Option, sondern Standard.
                  In allen Plänen inklusive — auch im kostenlosen Starter.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2">DSGVO-konform</h3>
                <p className="text-sm text-muted-foreground">
                  Hosting in Deutschland, transparente Datenverarbeitung und
                  automatische Löschfristen. Datenschutz ist bei uns Standard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Häufig gestellte Fragen</h2>
            <p className="text-muted-foreground">
              Antworten auf die wichtigsten Fragen zu schach.studio.
            </p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Bereit für den ersten Zug?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schließe dich modernen Schachvereinen an und bringe deine Verwaltung auf das nächste Level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="h-14 px-8 text-lg font-bold">
                Kostenlos starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/kontakt">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold">
                Demo anfordern
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
