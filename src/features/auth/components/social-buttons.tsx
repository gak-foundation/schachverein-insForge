"use client";

import { useState } from "react";
import { GitFork, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProviderId = "github" | "google";

const PROVIDER_META: Record<ProviderId, { label: string; Icon: typeof GitFork }> = {
  github: { label: "Weiter mit GitHub", Icon: GitFork },
  google: { label: "Weiter mit Google", Icon: Globe },
};

interface ProviderDef {
  id: ProviderId;
  onClick: () => void | Promise<void>;
}

interface SocialButtonsProps {
  providers: ProviderDef[];
  disabled?: boolean;
}

function ProviderButton({ provider, disabled }: { provider: ProviderDef; disabled: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const meta = PROVIDER_META[provider.id];
  const Icon = meta.Icon;

  const handleClick = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);
    try {
      await provider.onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="w-full h-11"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icon className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Wird verbunden..." : meta.label}
    </Button>
  );
}

export function SocialButtons({ providers, disabled = false }: SocialButtonsProps) {
  if (providers.length === 0) return null;

  return (
    <div className="space-y-3">
      {providers.map((p) => (
        <ProviderButton key={p.id} provider={p} disabled={disabled} />
      ))}
    </div>
  );
}
