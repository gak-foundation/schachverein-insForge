export const teams = "teams" as const;

export interface Team {
  id: string;
  clubId: string;
  name: string;
  seasonId: string;
  league: string | null;
  captainId: string | null;
  createdAt: string;
}

export interface NewTeam {
  id?: string;
  clubId: string;
  name: string;
  seasonId: string;
  league?: string | null;
  captainId?: string | null;
  createdAt?: string;
}

export const boardOrders = "board_orders" as const;

export interface BoardOrder {
  id: string;
  teamId: string;
  seasonId: string;
  memberId: string;
  boardNumber: number;
  isJoker: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewBoardOrder {
  id?: string;
  teamId: string;
  seasonId: string;
  memberId: string;
  boardNumber: number;
  isJoker?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export const teamMemberships = "team_memberships" as const;

export interface TeamMembership {
  id: string;
  teamId: string;
  memberId: string;
  seasonId: string;
  isRegular: boolean | null;
  createdAt: string;
}

export interface NewTeamMembership {
  id?: string;
  teamId: string;
  memberId: string;
  seasonId: string;
  isRegular?: boolean | null;
  createdAt?: string;
}
