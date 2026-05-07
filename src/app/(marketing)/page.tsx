import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { HeroSection } from "@/components/marketing/hero-section";
import dynamic from "next/dynamic";

const FeatureGrid = dynamic(() => import("@/components/marketing/feature-grid").then((mod) => mod.FeatureGrid));
const ProblemSolutionSection = dynamic(() => import("@/components/marketing/problem-solution-section").then((mod) => mod.ProblemSolutionSection));
const MiniManager = dynamic(() => import("@/components/marketing/mini-manager").then((mod) => mod.MiniManager));
const BlogSection = dynamic(() => import("@/features/blog/components/blog-section").then((mod) => mod.BlogSection));


import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4 text-foreground tracking-tight">Alles was dein Verein braucht</h2>
            <p className="text-muted-foreground">
              Entwickelt von Schachspielern für Schachvereine. Wir kennen eure Abläufe.
            </p>
          </div>
          <div className="max-w-5xl mx-auto mb-12">
            <div className="relative rounded-2xl overflow-hidden border shadow-2xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl blur opacity-20 motion-reduce:blur-none" />
              <div className="relative bg-card">
                <MiniManager />
              </div>
            </div>
          </div>
          <FeatureGrid />

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>WCAG 2.2 AA barrierefrei</span>
            </div>
            <span className="hidden sm:inline text-border">&bull;</span>
            <span>DSGVO-konform &middot; Hosting in Deutschland</span>
            <span className="hidden sm:inline text-border">&bull;</span>
            <span>Dauerhaft kostenfrei</span>
          </div>
        </div>
      </section>

      <ProblemSolutionSection />

      <BlogSection />

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 text-foreground tracking-tight">Bereit für den ersten Zug?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schließe dich modernen Schachvereinen an und bringe deine Verwaltung auf das nächste Level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 px-8 text-lg font-bold gap-2 inline-flex items-center justify-center"
              )}
            >
              Kostenlos starten
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/faq"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-14 px-8 text-lg gap-2 inline-flex items-center justify-center"
              )}
            >
              Häufige Fragen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
