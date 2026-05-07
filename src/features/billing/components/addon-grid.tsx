"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlanCard } from "./addon-card";
import { ADDON_CONFIG, type AddonId } from "@/lib/billing/addons";
import { createServiceClient } from "@/lib/insforge";

interface AddonGridProps {
  activeAddons: AddonId[];
  clubId: string;
}

export function AddonGrid({ activeAddons, clubId }: AddonGridProps) {
  const router = useRouter();
  const [localActive, setLocalActive] = useState<Set<string>>(new Set(activeAddons));
  const [loadingAddon, setLoadingAddon] = useState<string | null>(null);

  async function handleToggle(addonId: AddonId) {
    setLoadingAddon(addonId);
    try {
      const client = createServiceClient();
      const isCurrentlyActive = localActive.has(addonId);

      if (isCurrentlyActive) {
        // Deactivate
        await client
          .from("club_addons")
          .delete()
          .eq("club_id", clubId)
          .eq("addon_id", addonId);
        
        setLocalActive(prev => {
          const next = new Set(prev);
          next.delete(addonId);
          return next;
        });
      } else {
        // Activate (no payment needed)
        await client
          .from("club_addons")
          .insert({
            club_id: clubId,
            addon_id: addonId,
            status: "active",
            activated_at: new Date().toISOString(),
          });
        
        setLocalActive(prev => new Set(prev).add(addonId));
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling addon:", error);
      alert("Fehler beim Aktivieren. Bitte versuche es erneut.");
    } finally {
      setLoadingAddon(null);
    }
  }

  const allAddons = Object.values(ADDON_CONFIG);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
        Alle Features sind in deinem kostenlosen Plan enthalten
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAddons.map((addon) => (
          <PlanCard
            key={addon.id}
            plan={addon}
            isActive={localActive.has(addon.id)}
            onToggle={() => handleToggle(addon.id)}
          />
        ))}
      </div>
    </div>
  );
}
