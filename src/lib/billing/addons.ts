export type PlanId = "free" | "pro";
export type AddonId =
  | "finance"
  | "tournament_pro"
  | "professional"
  | "communication"
  | "storage_plus";

export interface AddonConfig {
  id: AddonId;
  name: string;
  description: string;
  price: number; // in cents (EUR)
  interval: "month" | "year";
  stripePriceId?: string;
  features: string[];
}

export const ADDON_CONFIG: Record<AddonId, AddonConfig> = {
  finance: {
    id: "finance",
    name: "Finanzmodul",
    description: "Professionelle Mitgliederabrechnung und Buchhaltung.",
    price: 990,
    interval: "month",
    features: [
      "SEPA-Lastschrift-Export",
      "Automatisiertes Mahnwesen",
      "Beitragsstufen-Verwaltung",
      "Zahlungs-Tracking",
      "Rechnungs-PDF-Erstellung",
    ],
  },
  tournament_pro: {
    id: "tournament_pro",
    name: "Turnier-Pro",
    description: "Alles für die Ausrichtung professioneller Schachturniere.",
    price: 990,
    interval: "month",
    features: [
      "Schweizer System (bbpPairings)",
      "TRF Import/Export",
      "Live-Ticker für Partien",
      "Erweiterte Kreuztabellen",
      "DSB/DeWIS Export",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "Dein Verein, deine Marke, dein Look.",
    price: 490,
    interval: "month",
    features: [
      "Eigene Domain",
      "White-Label Branding",
      "API-Zugang",
      "Erweiterte Analytics",
    ],
  },
  communication: {
    id: "communication",
    name: "Kommunikation",
    description: "Erreiche deine Mitglieder dort, wo sie sind.",
    price: 490,
    interval: "month",
    features: [
      "Newsletter-System",
      "Push-Benachrichtigungen",
      "Eltern-Portal",
      "Rundmails an Gruppen",
    ],
  },
  storage_plus: {
    id: "storage_plus",
    name: "Speicher+",
    description: "Viel Platz für deine Dokumente und Fotos.",
    price: 290,
    interval: "month",
    features: [
      "10 GB Speicher (statt 500 MB)",
      "Große Datei-Uploads",
      "Archivierungs-Funktion",
    ],
  },
};

export interface PlanConfig {
  id: PlanId;
  name: string;
  description: string;
  price: number; // in cents (EUR)
  interval: "month" | "year";
  stripePriceId?: string;
  features: string[];
}

export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Kostenlos",
    description: "Alles was dein Verein braucht, ohne Kosten.",
    price: 0,
    interval: "month",
    features: [
      "Unbegrenzte Mitglieder",
      "Mitgliederverwaltung",
      "Öffentliche Vereinsseite",
      "Terminkalender",
      "Mannschaftsaufstellungen",
      "DSGVO-konforme Datenverarbeitung",
      "E-Mail-Support",
    ],
  },
  // Deprecated: existing pro plan will be migrated to addons
  pro: {
    id: "pro",
    name: "Pro (Legacy)",
    description: "Legacy Pro Plan - wird auf Addons migriert.",
    price: 990,
    interval: "month",
    features: [
      "Eigene Domain",
      "Erweiterter Speicher",
      "API-Zugang",
      "Prioritäts-Support",
      "Erweiterte Analytics",
      "White-Label Branding",
    ],
  },
};

export function isPro(planId: string): boolean {
  return planId === "pro";
}

export function getPlanConfig(planId: PlanId): PlanConfig {
  return PLAN_CONFIG[planId];
}

export function getAddonConfig(addonId: AddonId): AddonConfig {
  return ADDON_CONFIG[addonId];
}

export function getAllPlans(): PlanConfig[] {
  return Object.values(PLAN_CONFIG);
}

export function getAllAddons(): AddonConfig[] {
  return Object.values(ADDON_CONFIG);
}

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export function getFeatureLabel(feature: string): string {
  return feature;
}
