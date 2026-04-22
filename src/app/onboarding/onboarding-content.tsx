"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Building2, Users, ArrowRight, Loader2, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { switchClubAction } from "@/lib/clubs/actions";

interface ClubInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  plan: "free" | "pro" | "enterprise";
  isActive: boolean;
}

interface OnboardingContentProps {
  hasClubs: boolean;
  userClubs: ClubInfo[];
}

export function OnboardingContent({ hasClubs, userClubs }: OnboardingContentProps) {
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSwitchClub(clubId: string) {
    setIsSwitching(clubId);
    setError(null);
    try {
      await switchClubAction(clubId);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verein konnte nicht ausgewählt werden");
    } finally {
      setIsSwitching(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">{error}</div>
      )}

      {hasClubs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" aria-hidden="true" />
              Ihre Vereine
            </CardTitle>
            <CardDescription>
              Wählen Sie einen Verein aus, um fortzufahren
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userClubs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine Vereine gefunden
              </p>
            ) : (
              userClubs.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => handleSwitchClub(club.id)}
                  disabled={isSwitching === club.id}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary overflow-hidden shrink-0">
                    {club.logoUrl ? (
                      <Image
                        src={club.logoUrl}
                        alt=""
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{club.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {club.plan === "free" && "Free Plan"}
                      {club.plan === "pro" && "Pro Plan"}
                      {club.plan === "enterprise" && "Enterprise Plan"}
                    </p>
                  </div>
                  {isSwitching === club.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  )}
                </button>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {!hasClubs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" aria-hidden="true" />
              Prototypenphase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              In der Prototypenphase können Vereine nur durch den Systemadministrator erstellt werden. Bitte warten Sie auf eine Einladung.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
