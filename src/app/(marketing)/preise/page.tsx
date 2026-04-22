import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle, Rocket, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeatureRow {
  name: string;
  tooltip?: string;
  starter: boolean | string;
  verein: boolean | string;
  pro: boolean | string;
}

const features: FeatureRow[] = [
  {
    name: "Mitglieder",
    tooltip: "Maximale Anzahl aktiver Mitglieder in Ihrem Verein",
    starter: "Bis 30",
    verein: "Bis 200",
    pro: "Unbegrenzt",
  },
  {
    name: "Admin-Nutzer",
    tooltip: "Anzahl Benutzer mit Administrationsrechten",
    starter: "1",
    verein: "3",
    pro: "Unbegrenzt",
  },
  {
    name: "Mitgliederverwaltung",
    starter: true,
    verein: true,
    pro: true,
  },
  {
    name: "Terminkalender",
    starter: true,
    verein: true,
    pro: true,
  },
  {
    name: "Einfache Statistik",
    starter: true,
    verein: true,
    pro: true,
  },
  {
    name: "Turnier-Manager",
    tooltip: "Schweizer System, Rundenturniere, Live-Ranglisten",
    starter: false,
    verein: true,
    pro: true,
  },
  {
    name: "Mannschaftsaufstellungen",
    starter: false,
    verein: true,
    pro: true,
  },
  {
    name: "Finanzmodul",
    tooltip: "Beitragsrechnungen, SEPA-Lastschriften, Mahnungen",
    starter: false,
    verein: true,
    pro: true,
  },
  {
    name: "E-Mail-Verteiler",
    tooltip: "DSGVO-konforme Newsletter an Mitglieder",
    starter: false,
    verein: true,
    pro: true,
  },
  {
    name: "Vereins-Website",
    tooltip: "Öffentliche Website mit Terminen, Ergebnissen und News",
    starter: false,
    verein: false,
    pro: true,
  },
  {
    name: "Online-Turniere",
    tooltip: "Integration mit Lichess für Online-Turniere",
    starter: false,
    verein: false,
    pro: true,
  },
  {
    name: "API-Zugang",
    tooltip: "REST-API für eigene Integrationen",
    starter: false,
    verein: false,
    pro: true,
  },
  {
    name: "White-Label",
    tooltip: "Eigene Domain und Branding",
    starter: false,
    verein: false,
    pro: true,
  },
  {
    name: "WCAG 2.2 AA",
    tooltip: "Barrierefreiheit nach höchsten Standards",
    starter: true,
    verein: true,
    pro: true,
  },
  {
    name: "DSGVO-konform",
    starter: true,
    verein: true,
    pro: true,
  },
  {
    name: "E-Mail-Support",
    tooltip: "Support-Antwort innerhalb von 24 Stunden",
    starter: true,
    verein: true,
    pro: true,
  },
  {
    name: "Prioritäts-Support",
    tooltip: "Support-Antwort innerhalb von 4 Stunden",
    starter: false,
    verein: false,
    pro: true,
  },
];

function renderValue(value: boolean | string) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-primary mx-auto" />
    ) : (
      <span className="text-muted-foreground/30">—</span>
    );
  }
  return <span className="font-medium">{value}</span>;
}

export const metadata = {
  title: "Preise | schach.studio",
  description:
    "Transparente Preise für jeden Verein. Starter kostenlos, Verein ab 9 €/Monat, Pro ab 20 €/Monat.",
};

export default function PricingPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-4">Transparente Preise</h1>
          <p className="text-xl text-muted-foreground">
            Wählen Sie den passenden Plan für Ihren Verein.
            <br />
            Alle Pläne sind monatlich kündbar.
          </p>
        </div>

        {/* Pilot Program Banner */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-8 shadow-xl sm:px-12 sm:py-10">
            <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span>Exklusives Pilot-Programm</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Werden Sie einer von 5 Pilotvereinen
                </h2>
                <p className="text-lg text-primary-foreground/90 max-w-xl">
                  Sichern Sie sich 1 Jahr kostenlos, lebenslang 50% Rabatt und 
                  persönlichen Support bei der Einführung Ihres Vereins.
                </p>
              </div>
              <div className="shrink-0">
                <Link href="/bewerbung?type=pilot">
                  <Button size="lg" variant="secondary" className="font-bold">
                    <Rocket className="mr-2 h-5 w-5" />
                    Jetzt Pilotverein werden
                  </Button>
                </Link>
              </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px] max-w-5xl mx-auto">
            <TooltipProvider>
              <div className="grid grid-cols-4 border rounded-xl overflow-hidden">
                <div className="bg-muted/50 p-4 font-bold border-b">Feature</div>
                <div className="bg-muted/50 p-4 font-bold text-center border-b border-l">
                  <div className="text-lg">Starter</div>
                  <div className="text-2xl font-bold">0 €</div>
                  <div className="text-sm text-muted-foreground">/ Monat</div>
                </div>
                <div className="bg-primary text-primary-foreground p-4 font-bold text-center border-b border-l">
                  <div className="text-lg">Verein</div>
                  <div className="text-2xl font-bold">9 €</div>
                  <div className="text-sm opacity-80">/ Monat</div>
                </div>
                <div className="bg-muted/50 p-4 font-bold text-center border-b border-l">
                  <div className="text-lg">Pro</div>
                  <div className="text-2xl font-bold">20 €</div>
                  <div className="text-sm text-muted-foreground">/ Monat</div>
                </div>

                {features.map((feature, index) => (
                  <React.Fragment key={`feature-${index}`}>
                    <div
                      className={`p-4 flex items-center gap-2 ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }`}
                    >
                      <span>{feature.name}</span>
                      {feature.tooltip && (
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{feature.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div
                      key={`starter-${index}`}
                      className={`p-4 text-center border-l ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }`}
                    >
                      {renderValue(feature.starter)}
                    </div>
                    <div
                      key={`verein-${index}`}
                      className={`p-4 text-center border-l bg-primary/5 ${
                        index % 2 === 0 ? "" : "bg-primary/[0.03]"
                      }`}
                    >
                      {renderValue(feature.verein)}
                    </div>
                    <div
                      key={`pro-${index}`}
                      className={`p-4 text-center border-l ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }`}
                    >
                      {renderValue(feature.pro)}
                    </div>
                  </React.Fragment>
                ))}

                <div className="p-4 border-t" />
                <div className="p-4 border-l border-t">
                  <Link href="/auth/signup" className="w-full">
                    <Button variant="outline" className="w-full">
                      Kostenlos starten
                    </Button>
                  </Link>
                </div>
                <div className="p-4 border-l border-t bg-primary/5">
                  <Link href="/auth/signup" className="w-full">
                    <Button className="w-full">Jetzt upgraden</Button>
                  </Link>
                </div>
                <div className="p-4 border-l border-t">
                  <Link href="/kontakt" className="w-full">
                    <Button variant="outline" className="w-full">
                      Kontakt
                    </Button>
                  </Link>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-16 p-6 rounded-xl bg-muted/30 border">
          <h3 className="font-bold mb-4">Häufig gestellte Fragen zu den Preisen</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Gibt es eine Mindestlaufzeit?</h4>
              <p className="text-sm text-muted-foreground">
                Nein, alle Pläne sind monatlich kündbar. Es gibt keine versteckten
                Kosten oder Mindestlaufzeiten.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Was passiert bei einer Überschreitung?</h4>
              <p className="text-sm text-muted-foreground">
                Wenn Sie die Mitgliederzahl überschreiten, können Sie keine neuen
                Mitglieder hinzufügen, bis Sie upgraden oder Mitglieder löschen.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Kann ich später upgraden?</h4>
              <p className="text-sm text-muted-foreground">
                Ja, Sie können jederzeit upgraden. Die neuen Features stehen Ihnen
                sofort zur Verfügung.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Gibt es Rabatte für Verbände?</h4>
              <p className="text-sm text-muted-foreground">
                Ja, wir bieten spezielle Konditionen für Schachverbände und
                Landesfachverbände. Kontaktieren Sie uns für ein individuelles Angebot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
