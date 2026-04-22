import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Wallet, Sparkles, Rocket, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/bewerbung?type=pilot" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-6 border border-primary/20 hover:bg-primary/20 transition-colors group">
            <Sparkles className="h-4 w-4 fill-current animate-pulse" />
            <span>Pilot-Programm: 1 Jahr kostenlos</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Die All-in-One-Schachvereinssoftware
            <span className="text-primary">.</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Barrierefrei nach BFSG umgesetzt. Bezahlbar für jeden Verein —
            ab 9 € pro Monat. <strong>Jetzt als Pilotverein 100% sparen!</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-8 text-lg font-bold w-full sm:w-auto">
                Kostenlos starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-bold w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/5"
              >
                <Play className="mr-2 h-5 w-5" />
                Demo erkunden
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="flex gap-4 p-4 rounded-lg bg-card border">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1">All-in-One</h3>
                <p className="text-sm text-muted-foreground">
                  Mitglieder, Turniere, Finanzen und mehr — alles an einem Ort.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-card border">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1">BFSG 2025</h3>
                <p className="text-sm text-muted-foreground">
                  Barrierefrei nach WCAG 2.2 AA umgesetzt. Bereit für die BFSG.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-card border border-primary/20 bg-primary/5">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1">Pilot-Aktion</h3>
                <p className="text-sm text-muted-foreground">
                  1 Jahr kostenlos + lebenslang 50% Rabatt für Pilotvereine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
