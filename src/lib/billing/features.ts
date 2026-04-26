import { ADDON_CONFIG, isPro, type PlanId, type AddonId } from "./addons";

export type FeatureKey =
  | "members"
  | "teams"
  | "events"
  | "publicPage"
  | "customDomain"
  | "whiteLabel"
  | "apiAccess"
  | "advancedAnalytics"
  | "sepaExport"
  | "dunning"
  | "contributions"
  | "swissSystem"
  | "trfExport"
  | "liveTicker"
  | "dewisExport"
  | "newsletter"
  | "pushNotifications"
  | "parentPortal"
  | "extendedStorage";

const FREE_FEATURES: FeatureKey[] = [
  "members",
  "teams",
  "events",
  "publicPage",
];

const ADDON_MAPPING: Record<FeatureKey, AddonId | null> = {
  members: null,
  teams: null,
  events: null,
  publicPage: null,
  customDomain: "professional",
  whiteLabel: "professional",
  apiAccess: "professional",
  advancedAnalytics: "professional",
  sepaExport: "finance",
  dunning: "finance",
  contributions: "finance",
  swissSystem: "tournament_pro",
  trfExport: "tournament_pro",
  liveTicker: "tournament_pro",
  dewisExport: "tournament_pro",
  newsletter: "communication",
  pushNotifications: "communication",
  parentPortal: "communication",
  extendedStorage: "storage_plus",
};

// Legacy mapping for Pro plan
const PRO_FEATURES: FeatureKey[] = [
  "customDomain",
  "whiteLabel",
  "apiAccess",
  "advancedAnalytics",
  "extendedStorage",
];

export function hasFeature(
  planId: PlanId,
  activeAddons: AddonId[],
  feature: FeatureKey
): boolean {
  if (FREE_FEATURES.includes(feature)) return true;
  
  const requiredAddon = ADDON_MAPPING[feature];
  if (requiredAddon && activeAddons.includes(requiredAddon)) {
    return true;
  }

  // Backward compatibility for legacy Pro plan
  if (isPro(planId) && PRO_FEATURES.includes(feature)) {
    return true;
  }

  return false;
}

export function getClubFeatures(
  planId: PlanId,
  activeAddons: AddonId[]
): Record<FeatureKey, boolean> {
  const features = {} as Record<FeatureKey, boolean>;
  const allFeatures = Object.keys(ADDON_MAPPING) as FeatureKey[];
  
  for (const f of allFeatures) {
    features[f] = hasFeature(planId, activeAddons, f);
  }
  
  return features;
}

export function getUpgradeMessage(feature: FeatureKey): string {
  if (FREE_FEATURES.includes(feature)) return "";
  
  const addonId = ADDON_MAPPING[feature];
  if (addonId) {
    const config = ADDON_CONFIG[addonId];
    return `Dieses Feature ist im Addon "${config.name}" enthalten.`;
  }
  
  return 'Dieses Feature ist in einem kostenpflichtigen Addon enthalten.';
}

export function getStorageLimit(planId: PlanId, activeAddons: AddonId[]): number {
  // Base limit: 500 MB
  let limit = 500 * 1024 * 1024;
  
  if (activeAddons.includes("storage_plus") || isPro(planId)) {
    limit = 10 * 1024 * 1024 * 1024; // 10 GB
  }
  
  return limit;
}

export function canAddMember(
  _planId: PlanId,
  _activeAddons: AddonId[],
  _currentCount: number
): { allowed: boolean; reason?: string } {
  // Always allowed in the new model
  return { allowed: true };
}
