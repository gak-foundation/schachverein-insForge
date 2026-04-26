"use client";

import { useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialButtonsProps {
  onGithubClick?: () => void | Promise<void>;
  disabled?: boolean;
}

export function SocialButtons({
  onGithubClick,
  disabled = false,
}: SocialButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubClick = async () => {
    if (!onGithubClick || isLoading || disabled) return;
    setIsLoading(true);
    try {
      await onGithubClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGithubClick}
      disabled={disabled || isLoading}
      className="w-full h-11"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Github className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Wird verbunden..." : "Weiter mit GitHub"}
    </Button>
  );
}