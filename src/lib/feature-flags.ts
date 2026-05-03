import { createServiceClient } from "@/lib/insforge";

export type FeatureFlag =
  | "whatsapp_integration"
  | "matrix_tournament_input"
  | "bulk_member_operations"
  | "datev_export"
  | "live_tournament_ticker";

export const ALL_FLAGS: { key: FeatureFlag; label: string; default: boolean }[] = [
  { key: "whatsapp_integration", label: "WhatsApp Integration", default: false },
  { key: "matrix_tournament_input", label: "Matrix-Ergebniseingabe", default: true },
  { key: "bulk_member_operations", label: "Bulk-Mitglieder-Operationen", default: true },
  { key: "datev_export", label: "DATEV-Export", default: true },
  { key: "live_tournament_ticker", label: "Live-Turnier-Ticker", default: false },
];

export async function isFeatureEnabled(
  flag: FeatureFlag,
  clubId: string
): Promise<boolean> {
  const client = createServiceClient();
  const { data } = await client
    .from("clubs")
    .select("feature_flags")
    .eq("id", clubId)
    .maybeSingle();

  const defaultVal = ALL_FLAGS.find((f) => f.key === flag)?.default ?? false;
  const flags = (data as any)?.feature_flags ?? {};
  return flags[flag] ?? defaultVal;
}

export async function setFeatureFlag(
  clubId: string,
  flag: FeatureFlag,
  enabled: boolean
) {
  const client = createServiceClient();
  const { data: current } = await client
    .from("clubs")
    .select("feature_flags")
    .eq("id", clubId)
    .maybeSingle();

  const flags = (current as any)?.feature_flags ?? {};
  flags[flag] = enabled;

  const { error } = await client
    .from("clubs")
    .update({ feature_flags: flags })
    .eq("id", clubId);

  if (error) throw new Error("Fehler beim Speichern: " + error.message);
}
