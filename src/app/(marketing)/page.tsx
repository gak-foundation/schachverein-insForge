import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Wallet } from "lucide-react";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { ProblemSolutionSection } from "@/components/marketing/problem-solution-section";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { MiniManager } from "@/components/marketing/mini-manager";
import { BlogSection } from "@/features/blog/components/blog-section";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4 text-foreground tracking-tight">Alles was dein Verein braucht</h2>
            <p className="text-muted-foreground">
              Entwickelt von Schachspielern für Schachvereine. Wir kennen eure Abläufe.
            </p>
          </div>
          <div className="max-w-5xl mx-auto mb-16">
            <div className="relative rounded-2xl overflow-hidden border shadow-2xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl blur opacity-20 motion-reduce:blur-none" />
              <div className="relative bg-card">
                <MiniManager />
              </div>
            </div>
          </div>
          <FeatureGrid />
        </div>
      </section>

      <ProblemSolutionSection />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Barrierefreiheit</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4 text-foreground tracking-tight">Bereit für die BFSG</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Das Barrierefreiheitsstärkungsgesetz (BFSG) verpflichtet Vereine ab einer bestimmten Größe,
                digitale Angebote barrierefrei zugänglich zu machen. Wir haben das schon für Sie erledigt.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Zap, title: "WCAG 2.2 AA", desc: "Vollständig umgesetzt nach den Web Content Accessibility Guidelines. Tastaturbedienbar, ausreichender Kontrast, klare Sprache." },
                { icon: Wallet, title: "Kostenfrei", desc: "Unsere Plattform ist für alle Vereine dauerhaft kostenfrei. Keine versteckten Kosten, keine Abos — einfach nutzen." },
                { icon: Shield, title: "DSGVO-konform", desc: "Hosting in Deutschland, transparente Datenverarbeitung und automatische Löschfristen. Datenschutz ist bei uns Standard." },
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-xl bg-card border transition-all duration-200 hover:shadow-md">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4 text-foreground tracking-tight">Häufig gestellte Fragen</h2>
            <p className="text-muted-foreground">
              Antworten auf die wichtigsten Fragen zu schach.studio.
            </p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      <BlogSection />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-foreground tracking-tight">Bereit für den ersten Zug?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schließe dich modernen Schachvereinen an und bringe deine Verwaltung auf das nächste Level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 px-8 text-lg font-bold gap-2 inline-flex items-center justify-center"
              )}
            >
              Kostenlos starten
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
