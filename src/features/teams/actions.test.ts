import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== HOISTED MOCKS =====
const { mockRevalidatePath, mockInsforgeClient, mockRequireClubId, tableChains } = vi.hoisted(() => {
  const chains = new Map<string, unknown>();
  return {
    mockRevalidatePath: vi.fn(),
    mockInsforgeClient: { from: vi.fn(), auth: {} as Record<string, unknown>, database: { from: vi.fn() } },
    mockRequireClubId: vi.fn(),
    tableChains: chains,
  };
});

// ===== MODULE MOCKS =====
vi.mock("next/cache", () => ({
  revalidatePath: (...args: string[]) => mockRevalidatePath(...args),
}));

vi.mock("@/lib/insforge", () => ({
  createClient: vi.fn(() => mockInsforgeClient),
  createServerClient: vi.fn(() => mockInsforgeClient),
  createServiceClient: vi.fn(() => mockInsforgeClient),
}));

vi.mock("@/lib/actions/utils", () => ({
  requireClubId: mockRequireClubId,
}));

// ===== IMPORTS =====
import * as teams from "./actions";
import { mockFormData } from "@/lib/test/helpers";
import { createMockTeam } from "@/lib/test/factories";

function makeChain(returnData: unknown = []) {
  const data = returnData;
  const singleData = Array.isArray(data) ? data[0] ?? null : data;
  const singleErr = singleData ? null : { message: "no rows" };
  const singleThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: singleData, error: singleErr })) };
  const insertThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: null, error: null })) };

  const chain = {
    eq: vi.fn(() => chain), or: vi.fn(() => chain), order: vi.fn(() => chain),
    limit: vi.fn(() => chain), offset: vi.fn(() => chain), range: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(() => singleThenable),
    maybeSingle: vi.fn(() => singleThenable),
    insert: vi.fn(() => insertThenable),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data, error: null })),
  };
  return chain;
}

function setupTable(table: string, returnData: unknown = []) {
  const chain = makeChain(returnData);
  tableChains.set(table, chain);
  mockInsforgeClient.from.mockImplementation((t: string) => {
    return (tableChains.get(t) as ReturnType<typeof makeChain>) || makeChain([]);
  });
  return chain;
}

describe("Team Actions", () => {
  const mockTeam = createMockTeam();
  const mockTeamData = { id: mockTeam.id, name: mockTeam.name, season_id: mockTeam.seasonId, league: mockTeam.league, captain_id: mockTeam.captainId };

  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
    mockRequireClubId.mockResolvedValue("club-1");
  });

  describe("getTeams", () => {
    it("sollte alle Mannschaften des Vereins zurückgeben", async () => {
      setupTable("teams", [mockTeamData]);

      const result = await teams.getTeams();
      expect(result).toEqual([mockTeamData]);
    });
  });

  describe("getTeamById", () => {
    it("sollte eine Mannschaft anhand der ID zurückgeben", async () => {
      setupTable("teams", [mockTeam]);

      const result = await teams.getTeamById("team-1");
      expect(result).toEqual(mockTeam);
    });

    it("sollte null zurückgeben wenn Mannschaft nicht gefunden", async () => {
      setupTable("teams", []);

      const result = await teams.getTeamById("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("createTeam", () => {
    it("sollte eine Mannschaft ohne captainId erstellen", async () => {
      setupTable("seasons", [{ id: "season-1" }]);
      setupTable("teams");

      const formData = mockFormData({
        name: "1. Mannschaft", seasonId: "season-1",
      });

      await expect(teams.createTeam(formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/teams");
    });

    it("sollte Fehler werfen wenn Saison nicht gefunden", async () => {
      setupTable("seasons", []);

      const formData = mockFormData({
        name: "1. Mannschaft", seasonId: "non-existent-season",
      });

      await expect(teams.createTeam(formData)).rejects.toThrow("Saison nicht gefunden");
    });
  });

  describe("updateTeam", () => {
    it("sollte eine Mannschaft aktualisieren", async () => {
      setupTable("teams", [mockTeam]);
      setupTable("seasons", [{ id: "season-1" }]);

      const formData = mockFormData({
        id: "team-1", name: "Aktualisierte Mannschaft", seasonId: "season-1",
      });

      await teams.updateTeam(formData);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/teams");
    });

    it("sollte Fehler werfen wenn Mannschaft nicht gefunden", async () => {
      setupTable("teams", []);

      const formData = mockFormData({
        id: "non-existent", name: "Mannschaft", seasonId: "season-1",
      });

      await expect(teams.updateTeam(formData)).rejects.toThrow("Mannschaft nicht gefunden");
    });
  });

  describe("deleteTeam", () => {
    it("sollte eine Mannschaft löschen", async () => {
      setupTable("teams", [mockTeam]);

      await teams.deleteTeam("team-1");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/teams");
    });

    it("sollte Fehler werfen wenn Mannschaft nicht gefunden", async () => {
      setupTable("teams", []);

      await expect(teams.deleteTeam("non-existent")).rejects.toThrow("Mannschaft nicht gefunden");
    });
  });
});
