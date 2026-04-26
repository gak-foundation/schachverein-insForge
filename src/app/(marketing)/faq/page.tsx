import type { Metadata } from "next";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ | schach.studio",
  description:
    "Häufig gestellte Fragen zur modernen Schachvereins-Verwaltung. Antworten zu Preisen, Datenschutz, Barrierefreiheit und mehr.",
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Häufig gestellte Fragen
            </h1>
            <p className="text-muted-foreground">
              Antworten auf die wichtigsten Fragen zu schach.studio.
            </p>
          </div>
          <FAQAccordion />
        </div>
      </section>
    </div>
  );
}
