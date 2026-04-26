"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlanCard } from "./addon-card";
import { ADDON_CONFIG, type AddonId } from "@/lib/billing/addons";

interface AddonGridProps {
  activeAddons: AddonId[];
  clubId: string;
}

export function AddonGrid({ activeAddons, clubId }: AddonGridProps) {
  const router = useRouter();
  const [loadingAddon, setLoadingAddon] = useState<string | null>(null);

  async function handleSubscribe(addonId: AddonId) {
    setLoadingAddon(addonId);
    try {
      const res = await fetch("/api/addons/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          addonId,
          returnUrl: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoadingAddon(null);
    }
  }

  async function handleCancel(addonId: AddonId) {
    const addon = ADDON_CONFIG[addonId];
    if (!confirm(`Möchtest du das Addon "${addon.name}" wirklich kündigen?`)) return;
    
    setLoadingAddon(addonId);
    try {
      const res = await fetch("/api/addons/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, addonId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({ error: "Kündigung fehlgeschlagen" }));
        alert(data.error || "Kündigung fehlgeschlagen");
      }
    } finally {
      setLoadingAddon(null);
    }
  }

  const allAddons = Object.values(ADDON_CONFIG);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allAddons.map((addon) => (
        <PlanCard
          key={addon.id}
          plan={addon}
          isActive={activeAddons.includes(addon.id)}
          onSubscribe={() => handleSubscribe(addon.id)}
          onCancel={() => handleCancel(addon.id)}
          isLoading={loadingAddon === addon.id}
        />
      ))}
    </div>
  );
}
