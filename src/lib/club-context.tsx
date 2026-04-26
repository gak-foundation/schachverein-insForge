"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { PlanId, AddonId } from "@/lib/billing/addons";

interface Club {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  plan: PlanId;
  activeAddons: AddonId[];
  isActive: boolean;
}

interface ClubContextType {
  activeClub: Club | null;
  userClubs: Club[];
  setActiveClub: (club: Club) => void;
  switchClub: (clubId: string) => Promise<void>;
  isLoading: boolean;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

interface ClubProviderProps {
  children: ReactNode;
  initialClub: Club | null;
  userClubs: Club[];
}

export function ClubProvider({ children, initialClub, userClubs }: ClubProviderProps) {
  const [activeClub, setActiveClubState] = useState<Club | null>(initialClub);
  const [isLoading, setIsLoading] = useState(false);

  const setActiveClub = useCallback((club: Club) => {
    setActiveClubState(club);
  }, []);

  const switchClub = useCallback(async (clubId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/clubs/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Wechseln des Vereins");
      }

      const newClub = userClubs.find((c) => c.id === clubId);
      if (newClub) {
        setActiveClubState(newClub);
        window.location.reload();
      }
    } catch (error) {
      console.error("Club switch error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userClubs]);

  return (
    <ClubContext.Provider
      value={{
        activeClub,
        userClubs,
        setActiveClub,
        switchClub,
        isLoading,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error("useClub must be used within a ClubProvider");
  }
  return context;
}

export function useActiveClub() {
  const { activeClub } = useClub();
  return activeClub;
}

export function useUserClubs() {
  const { userClubs } = useClub();
  return userClubs;
}

export function useClubSwitch() {
  const { switchClub, isLoading } = useClub();
  return { switchClub, isLoading };
}

export type { Club };
