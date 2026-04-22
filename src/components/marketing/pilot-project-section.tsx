import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Rocket, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PilotProjectSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Pilotprojekt</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Aktuell: 0 € für Pilotvereine
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wir suchen die ersten 5 Vereine, die mit uns gemeinsam schach.studio aufbauen.
              Als Dankeschön gibt es das volle Paket ein Jahr komplett kostenlos —
              und danach lebenslang 50 % Rabatt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="bg-card border rounded-2xl p-8 shadow-sm">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold">0 €</span>
                <span className="text-muted-foreground">/ Monat</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Im Pilotprojekt sind alle Funktionen enthalten — ohne Einschränkungen.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unbegrenzte Mitglieder",
                  "Turnier-Manager & Paarungen",
                  "Finanzmodul & Beiträge",
                  "Vereins-Website",
                  "Prioritäts-Support",
                  "Lebenslang 50 % Rabatt nach dem Pilotjahr",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/bewerbung?type=pilot"
                className={cn(buttonVariants({ size: "lg" }), "w-full font-bold gap-2 justify-center")}
              >
                <Rocket className="h-5 w-5" aria-hidden="true" />
                Jetzt als Pilotverein bewerben
              </Link>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Nur noch wenige Plätze verfügbar
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "Was ist das Pilotprojekt?",
                  desc: "Gemeinsam mit dir entwickeln wir die ideale Software für deinen Verein. Du bekommst frühzeitig Zugang zu allen Funktionen und hilfst uns, das Produkt noch besser zu machen.",
                },
                {
                  title: "Was kostet es nach dem Pilotjahr?",
                  desc: "Nach dem kostenlosen Jahr kannst du mit lebenslang 50 % Rabatt weitermachen. Die regulären Preise werden später bekannt gegeben — Pilotvereine bleiben auf jeden Fall die Günstigsten.",
                },
                {
                  title: "Wie kann ich mich bewerben?",
                  desc: "Fülle einfach das Bewerbungsformular aus. Wir prüfen deine Anmeldung und melden uns innerhalb von 48 Stunden bei dir.",
                  link: { href: "/bewerbung?type=pilot", label: "Zur Bewerbung" },
                },
              ].map((card) => (
                <div key={card.title} className="p-6 rounded-xl bg-muted/50 border transition-all duration-200 hover:shadow-sm">
                  <h3 className="font-bold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                  {card.link && (
                    <Link
                      href={card.link.href}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    >
                      {card.link.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
