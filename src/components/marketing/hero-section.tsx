import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Sparkles, Rocket, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50 motion-reduce:blur-none" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/bewerbung?type=pilot"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-6 border border-primary/20 hover:bg-primary/20 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Sparkles className="h-4 w-4 fill-current animate-pulse motion-reduce:animate-none" aria-hidden="true" />
            <span>Pilot-Programm: 1 Jahr kostenlos</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform motion-reduce:transition-none" aria-hidden="true" />
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Die All-in-One-Schachvereinssoftware
            <span className="text-primary">.</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Barrierefrei nach BFSG umgesetzt. Für jeden Verein bezahlbar —
            aktuell <strong>0 € im Pilotprojekt</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/auth/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 px-8 text-lg font-bold w-full sm:w-auto gap-2"
              )}
            >
              Kostenlos starten
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { icon: Zap, title: "All-in-One", desc: "Mitglieder, Turniere, Finanzen und mehr — alles an einem Ort." },
              { icon: Shield, title: "BFSG 2025", desc: "Barrierefrei nach WCAG 2.2 AA umgesetzt. Bereit für die BFSG." },
              { icon: Lock, title: "Datenschutz", desc: "DSGVO-konform. Hosting in Deutschland, verschlüsselte Daten." },
              { icon: Rocket, title: "Pilot-Aktion", desc: "1 Jahr kostenlos + lebenslang 50% Rabatt für Pilotvereine.", highlighted: true },
            ].map((feature) => (
              <div
                key={feature.title}
                className={cn(
                  "flex gap-4 p-4 rounded-lg bg-card border transition-all duration-200 hover:shadow-md",
                  feature.highlighted && "border-primary/20 bg-primary/5"
                )}
              >
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
