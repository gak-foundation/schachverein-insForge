import Link from "next/link";
import { Check, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  cta: {
    text: string;
    href: string;
    variant?: "default" | "outline";
  };
  highlighted?: boolean;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: "0",
    period: "€ / Monat",
    description: "Für kleine Vereine, die starten wollen",
    features: [
      { text: "Bis zu 20 Mitglieder", included: true },
      { text: "Mitgliederverwaltung", included: true },
      { text: "Terminkalender", included: true },
      { text: "Einfache Statistik", included: true },
      { text: "E-Mail-Support", included: true },
      { text: "Turnier-Manager", included: false },
      { text: "Finanzmodul", included: false },
      { text: "Vereins-Website", included: false },
    ],
    cta: {
      text: "Kostenlos starten",
      href: "/auth/signup",
      variant: "outline",
    },
  },
  {
    name: "Verein",
    price: "9",
    period: "€ / Monat",
    description: "Für aktive Vereine mit Wachstum",
    features: [
      { text: "Bis zu 100 Mitglieder", included: true },
      { text: "Mitgliederverwaltung", included: true },
      { text: "Turnier-Manager", included: true },
      { text: "Mannschaftsaufstellungen", included: true },
      { text: "Finanzmodul", included: true },
      { text: "DSGVO-konform", included: true },
      { text: "WCAG 2.2 AA umgesetzt", included: true },
      { text: "E-Mail-Support", included: true },
    ],
    cta: {
      text: "Jetzt upgraden",
      href: "/auth/signup",
      variant: "default",
    },
    highlighted: true,
    badge: "Empfohlen",
  },
  {
    name: "Pro",
    price: "20",
    period: "€ / Monat",
    description: "Für große Vereine mit allen Features",
    features: [
      { text: "Unbegrenzte Mitglieder", included: true },
      { text: "Alle Verein-Features", included: true },
      { text: "Vereins-Website", included: true },
      { text: "Online-Turniere", included: true },
      { text: "Erweiterte Berichte", included: true },
      { text: "API-Zugang", included: true },
      { text: "Prioritäts-Support", included: true },
      { text: "White-Label Option", included: true },
    ],
    cta: {
      text: "Kontakt aufnehmen",
      href: "/kontakt",
      variant: "outline",
    },
  },
];

export function PricingCards({ className }: { className?: string }) {
  return (
    <div className="space-y-12">
      <div className={cn("grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto", className)}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative rounded-xl p-6 lg:p-8 flex flex-col",
              plan.highlighted
                ? "bg-primary text-primary-foreground shadow-xl scale-105"
                : "bg-card border shadow-sm"
            )}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3
                className={cn(
                  "text-xl font-bold mb-2",
                  plan.highlighted ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-4xl font-bold",
                    plan.highlighted ? "text-primary-foreground" : "text-foreground"
                  )}
                >
                  {plan.price}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}
                >
                  {plan.period}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm mt-2",
                  plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                {plan.description}
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature.text} className="flex items-start gap-3">
                  <Check
                    className={cn(
                      "h-5 w-5 shrink-0",
                      feature.included
                        ? plan.highlighted
                          ? "text-primary-foreground"
                          : "text-primary"
                        : plan.highlighted
                        ? "text-primary-foreground/30"
                        : "text-muted-foreground/30"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm",
                      feature.included
                        ? plan.highlighted
                          ? "text-primary-foreground"
                          : "text-foreground"
                        : plan.highlighted
                        ? "text-primary-foreground/40"
                        : "text-muted-foreground/40"
                    )}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link href={plan.cta.href}>
              <Button
                variant={plan.cta.variant}
                className={cn(
                  "w-full",
                  plan.highlighted && "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                )}
              >
                {plan.cta.text}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* Pilot Banner */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Spezielles Pilot-Programm</h4>
              <p className="text-muted-foreground text-sm">
                Sichern Sie sich 1 Jahr kostenlos & lebenslang 50% Rabatt. 
                Begrenzt auf die ersten 5 Vereine.
              </p>
            </div>
          </div>
          <Link href="/bewerbung?type=pilot">
            <Button variant="default" className="font-bold whitespace-nowrap">
              <Rocket className="mr-2 h-4 w-4" />
              Jetzt bewerben
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
