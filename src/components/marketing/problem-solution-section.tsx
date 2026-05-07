import { Check, X } from "lucide-react";

const comparisons = [
  {
    problem: "Doppeltpflege (Verwaltung + Website)",
    solution: "Single Source of Truth: Verwaltung befÃ¼llt Website",
  },
  {
    problem: "Excel-Listen auf privaten Laptops",
    solution: "Zentrale, cloudbasierte Mitgliederakte",
  },
  {
    problem: "Manuelle SEPA-Eingabe bei der Bank",
    solution: "Automatischer Export (pain.008 XML)",
  },
  {
    problem: "Ergebnisse erst Tage spÃ¤ter online",
    solution: "Live-Turnierkarten mit Echtzeit-Tabelle",
  },
  {
    problem: "WhatsApp-Chaos bei Aufstellungen",
    solution: "Strukturierte VerfÃ¼gbarkeitsabfragen",
  },
  {
    problem: "Ungewissheit bei Bildrechten",
    solution: "Versioniertes Consent-Management",
  },
];

export function ProblemSolutionSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Schluss mit der Zettelwirtschaft</h2>
          <p className="text-muted-foreground">
            Wir haben die typischen Schmerzpunkte der Vereinsverwaltung analysiert und moderne LÃ¶sungen geschaffen.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border shadow-xl bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b bg-muted/50">
            <div className="p-4 text-center font-bold text-muted-foreground uppercase tracking-wider text-xs">
              Heute (Der Schmerz)
            </div>
            <div className="p-4 text-center font-bold text-primary uppercase tracking-wider text-xs">
              Morgen (Die LÃ¶sung)
            </div>
          </div>
          <div className="divide-y">
            {comparisons.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x transition-colors hover:bg-muted/30">
                <div className="p-6 flex items-start gap-3 bg-muted/20">
                  <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-muted-foreground italic">{item.problem}</span>
                </div>
                <div className="p-6 flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="font-medium">{item.solution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-primary mb-2">â€žschach.studio spart uns ca. 4 Stunden Verwaltungsarbeit pro Woche.â€œ</p>
          <p className="text-sm text-muted-foreground">â€” Beispiel-Vorstand, SC Musterstadt</p>
        </div>
      </div>
    </section>
  );
}
