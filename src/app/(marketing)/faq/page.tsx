import type { Metadata } from "next";
import { FAQAccordion, detailedFAQ } from "@/components/marketing/faq-accordion";
import { HelpCircle, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Häufig gestellte Fragen (FAQ) | schach.studio",
  description:
    "Detaillierte Antworten zu schach.studio: Funktionen, Preise, Sicherheit, Datenschutz, Einrichtung, Migration und Support. Alles über die Schachvereins-Verwaltungssoftware.",
  openGraph: {
    title: "FAQ – Häufig gestellte Fragen | schach.studio",
    description:
      "Detaillierte Antworten zu schach.studio: Funktionen, Preise, Sicherheit, Datenschutz, Einrichtung, Migration und Support. Alles über die Schachvereins-Verwaltungssoftware.",
  },
};

export default function FAQPage() {
  return (
    <div className="flex flex-col">
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Support</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 font-heading tracking-tight">
              Häufig gestellte Fragen
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Alles, was Sie über schach.studio wissen müssen – von Funktionen und
              Preisen über Sicherheit und Datenschutz bis hin zu Migration und Support.
            </p>
          </div>
          <FAQAccordion sections={detailedFAQ} />
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-card border rounded-2xl p-8 sm:p-10 shadow-sm">
              <h2 className="text-xl font-bold mb-3">Nicht fündig geworden?</h2>
              <p className="text-muted-foreground mb-6">
                Wir helfen Ihnen gerne persönlich weiter. Schreiben Sie uns eine
                E-Mail oder vereinbaren Sie eine kostenlose Demo.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="mailto:support@schach.studio"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "gap-2"
                  )}
                >
                  <Mail className="h-4 w-4" />
                  E-Mail an Support
                </Link>
                <Link
                  href="/kontakt"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "gap-2"
                  )}
                >
                  Zum Kontaktformular
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
