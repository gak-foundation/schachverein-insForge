import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getAllAddons, formatPrice, getFeatureLabel } from "@/lib/billing/addons";

export function PricingCards({ className }: { className?: string }) {
  const addons = getAllAddons();

  return (
    <div className={cn("space-y-12", className)}>
      <div className="max-w-lg mx-auto">
        <div className="relative rounded-xl p-6 lg:p-8 flex flex-col bg-primary text-primary-foreground shadow-xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-xl font-bold">Kostenlos \u2014 F\u00fcr immer</h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">0</span>
              <span className="text-sm opacity-70">\u20ac / dauerhaft</span>
            </div>
            <p className="mt-2 text-sm opacity-80">
              Alles was dein Verein braucht, ohne Kosten. Unbegrenzte Mitglieder, Turniere, Termine und mehr.
            </p>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            {[
              "Unbegrenzte Mitglieder",
              "Mitgliederverwaltung",
              "\u00d6ffentliche Vereinsseite (Subdomain)",
              "Terminkalender",
              "Mannschaftsaufstellungen",
              "Basis-Turniere (Rundenturniere)",
              "Ergebniseingabe \u0026 Tabellen",
              "DSGVO-konforme Datenverarbeitung",
              "WCAG 2.2 AA Barrierefreiheit",
              "E-Mail-Support",
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <Check className="h-5 w-5 shrink-0" />
                <span className="opacity-90">{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/auth/signup"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full font-bold")}
          >
            Kostenlos starten
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-center text-xl font-semibold">Bezahlbare Addons \u2014 Nur das, was du brauchst</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className="relative rounded-xl p-6 flex flex-col bg-card border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h4 className="text-lg font-bold">{addon.name}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold">{formatPrice(addon.price)}</span>
                  <span className="text-sm text-muted-foreground">/Monat</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{addon.description}</p>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {addon.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{getFeatureLabel(feature)}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full")}
              >
                Hinzubuchen
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Kombi-Rabatt: 2 Addons = 10% Rabatt \u00b7 3+ Addons = 20% Rabatt
        </p>
      </div>
    </div>
  );
}
