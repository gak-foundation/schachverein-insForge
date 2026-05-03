import type { SeasonType } from "./enums";

export const seasons = "seasons" as const;

export interface Season {
  id: string;
  clubId: string;
  name: string;
  year: number;
  type: SeasonType;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface NewSeason {
  id?: string;
  clubId: string;
  name: string;
  year: number;
  type?: SeasonType;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
}
