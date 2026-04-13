// Feature Gates & Plan Management for Multi-Tenancy

export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free",
    description: "Für kleine Vereine bis 30 Mitglieder",
    price: 0,
    interval: "month" as const,
    maxMembers: 30,
    features: {
      members: true,
      teams: true,
      tournaments: true,
      events: true,
      payments: true,
      documents: true,
      apiAccess: false,
      customDomain: false,
      prioritySupport: false,
      bulkImport: false,
      advancedAnalytics: false,
      whiteLabel: false,
      dedicatedSupport: false,
    },
    limits: {
      maxTeams: 3,
      maxTournaments: 5,
      maxDocuments: 50,
      maxDocumentSize: 10 * 1024 * 1024, // 10MB
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Unbegrenzte Mitglieder und alle Features",
    price: 29,
    interval: "month" as const,
    maxMembers: Infinity,
    features: {
      members: true,
      teams: true,
      tournaments: true,
      events: true,
      payments: true,
      documents: true,
      apiAccess: true,
      customDomain: false,
      prioritySupport: false,
      bulkImport: true,
      advancedAnalytics: true,
      whiteLabel: false,
      dedicatedSupport: false,
    },
    limits: {
      maxTeams: Infinity,
      maxTournaments: Infinity,
      maxDocuments: 500,
      maxDocumentSize: 50 * 1024 * 1024, // 50MB
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Maßgeschneiderte Lösung für Großvereine",
    price: null, // Custom pricing
    interval: "month" as const,
    maxMembers: Infinity,
    features: {
      members: true,
      teams: true,
      tournaments: true,
      events: true,
      payments: true,
      documents: true,
      apiAccess: true,
      customDomain: true,
      prioritySupport: true,
      bulkImport: true,
      advancedAnalytics: true,
      whiteLabel: true,
      dedicatedSupport: true,
    },
    limits: {
      maxTeams: Infinity,
      maxTournaments: Infinity,
      maxDocuments: Infinity,
      maxDocumentSize: 100 * 1024 * 1024, // 100MB
    },
  },
};

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;
export type FeatureKey = keyof typeof SUBSCRIPTION_PLANS["free"]["features"];

export function getPlan(planId: string) {
  return SUBSCRIPTION_PLANS[planId as PlanId] ?? SUBSCRIPTION_PLANS.free;
}

export function hasFeature(planId: string, feature: FeatureKey): boolean {
  const plan = getPlan(planId);
  return plan.features[feature] ?? false;
}

export function getPlanLimit(planId: string, limitKey: keyof typeof SUBSCRIPTION_PLANS["free"]["limits"]): number {
  const plan = getPlan(planId);
  return plan.limits[limitKey] ?? 0;
}

export function canAddMember(currentCount: number, planId: string): {
  allowed: boolean;
  reason?: string;
} {
  const plan = getPlan(planId);

  if (plan.maxMembers === Infinity) {
    return { allowed: true };
  }

  if (currentCount >= plan.maxMembers) {
    return {
      allowed: false,
      reason: `Maximale Mitgliederzahl (${plan.maxMembers}) für ${plan.name} Plan erreicht. Upgrade auf Pro für unbegrenzte Mitglieder.`,
    };
  }

  return { allowed: true };
}

export function getUpgradeMessage(planId: string, feature: FeatureKey): string {
  const messages: Record<FeatureKey, string> = {
    members: "Upgrade auf Pro für unbegrenzte Mitglieder",
    teams: "Upgrade auf Pro für unbegrenzte Mannschaften",
    tournaments: "Upgrade auf Pro für unbegrenzte Turniere",
    events: "Diese Funktion ist in Ihrem Plan nicht verfügbar",
    payments: "Diese Funktion ist in Ihrem Plan nicht verfügbar",
    documents: "Upgrade auf Pro für mehr Speicherplatz",
    apiAccess: "Upgrade auf Pro für API-Zugriff",
    customDomain: "Enterprise-Plan für eigene Domain erforderlich",
    prioritySupport: "Enterprise-Plan für Prioritätssupport erforderlich",
    bulkImport: "Upgrade auf Pro für Massenimport",
    advancedAnalytics: "Upgrade auf Pro für erweiterte Analysen",
    whiteLabel: "Enterprise-Plan erforderlich",
    dedicatedSupport: "Enterprise-Plan erforderlich",
  };

  return messages[feature] ?? "Upgrade erforderlich";
}

// Feature availability checks
export const FEATURE_AVAILABILITY: Record<FeatureKey, PlanId[]> = {
  members: ["free", "pro", "enterprise"],
  teams: ["free", "pro", "enterprise"],
  tournaments: ["free", "pro", "enterprise"],
  events: ["free", "pro", "enterprise"],
  payments: ["free", "pro", "enterprise"],
  documents: ["free", "pro", "enterprise"],
  apiAccess: ["pro", "enterprise"],
  customDomain: ["enterprise"],
  prioritySupport: ["enterprise"],
  bulkImport: ["pro", "enterprise"],
  advancedAnalytics: ["pro", "enterprise"],
  whiteLabel: ["enterprise"],
  dedicatedSupport: ["enterprise"],
};

export function getFeatureAvailability(feature: FeatureKey): PlanId[] {
  return FEATURE_AVAILABILITY[feature] ?? [];
}

export function isFeatureAvailable(feature: FeatureKey, planId: string): boolean {
  const availablePlans = getFeatureAvailability(feature);
  return availablePlans.includes(planId as PlanId);
}
