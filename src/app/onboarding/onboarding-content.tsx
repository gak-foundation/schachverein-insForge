"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Building2, Users, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateClubForm } from "@/components/clubs/create-club-form";
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
  const [isCreating, setIsCreating] = useState(!hasClubs);
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
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
      )}

      {hasClubs && !isCreating && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
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
                    onClick={() => handleSwitchClub(club.id)}
                    disabled={isSwitching === club.id}
                    className="w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary overflow-hidden shrink-0">
                      {club.logoUrl ? (
                        <Image
                          src={club.logoUrl}
                          alt={club.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-6 w-6" />
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
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Oder erstellen Sie einen neuen Verein
            </p>
            <Button variant="outline" onClick={() => setIsCreating(true)}>
              <Building2 className="mr-2 h-4 w-4" />
              Neuen Verein erstellen
            </Button>
          </div>
        </>
      )}

      {(isCreating || !hasClubs) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Neuen Verein erstellen
            </CardTitle>
            <CardDescription>
              Erstellen Sie einen neuen Verein für Ihren Schachclub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateClubForm
              onSuccess={() => {
                router.push("/dashboard");
              }}
            />
            {hasClubs && (
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => setIsCreating(false)}
              >
                Zurück zur Auswahl
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
