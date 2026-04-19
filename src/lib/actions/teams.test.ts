import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== HOISTED MOCKS =====
const { mockRevalidatePath, mockDb, mockRequireClubId } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockDb: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      teams: { findMany: vi.fn(), findFirst: vi.fn() },
      matches: { findMany: vi.fn(), findFirst: vi.fn() },
    },
  },
  mockRequireClubId: vi.fn(),
}));

// ===== MODULE MOCKS =====
vi.mock("next/cache", () => ({
  revalidatePath: (...args: string[]) => mockRevalidatePath(...args),
}));

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

vi.mock("@/lib/actions/utils", () => ({
  requireClubId: mockRequireClubId,
}));

// ===== IMPORTS =====
import * as teams from "./teams";
import { mockFormData } from "@/lib/test/helpers";
import { createMockTeam } from "@/lib/test/factories";

describe("Team Actions", () => {
  const mockTeam = createMockTeam();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireClubId.mockResolvedValue("club-1");
  });

  // Helper to create chainable select mock
  function createSelectChain(returnValue: unknown) {
    const chain = {
      where: vi.fn(() => chain),
      andWhere: vi.fn(() => chain),
      orderBy: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      offset: vi.fn(() => chain),
      innerJoin: vi.fn(() => chain),
      then: vi.fn((cb: (val: unknown) => unknown) => Promise.resolve(cb(returnValue))),
    };
    return { from: vi.fn(() => chain) };
  }

  describe("getTeams", () => {
    it("sollte alle Mannschaften des Vereins zurückgeben", async () => {
      const mockTeams = [mockTeam];
      mockDb.select.mockReturnValue(createSelectChain(mockTeams));

      const result = await teams.getTeams();

      expect(result).toEqual(mockTeams);
    });
  });

  describe("getTeamById", () => {
    it("sollte eine Mannschaft anhand der ID zurückgeben", async () => {
      mockDb.select.mockReturnValue(createSelectChain([mockTeam]));

      const result = await teams.getTeamById("team-1");

      expect(result).toEqual(mockTeam);
    });

    it("sollte null zurückgeben wenn Mannschaft nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      const result = await teams.getTeamById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("createTeam", () => {
    it("sollte eine Mannschaft erstellen", async () => {
      mockDb.select.mockReturnValue(createSelectChain([{ id: "season-1" }, { id: "membership-1" }]));
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      const formData = mockFormData({
        name: "1. Mannschaft",
        seasonId: "season-1",
        captainId: "member-1",
      });

      await teams.createTeam(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/teams");
    });

    it("sollte Fehler werfen wenn Saison nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      const formData = mockFormData({
        name: "1. Mannschaft",
        seasonId: "non-existent-season",
      });

      await expect(teams.createTeam(formData)).rejects.toThrow("Saison nicht gefunden");
    });
  });

  describe("updateTeam", () => {
    it("sollte eine Mannschaft aktualisieren", async () => {
      mockDb.select.mockReturnValue(createSelectChain([mockTeam, { id: "membership-1" }]));
      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      });

      const formData = mockFormData({
        id: "team-1",
        name: "Aktualisierte Mannschaft",
        seasonId: "season-1",
      });

      await teams.updateTeam(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/teams");
    });

    it("sollte Fehler werfen wenn Mannschaft nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      const formData = mockFormData({
        id: "non-existent",
        name: "Mannschaft",
        seasonId: "season-1",
      });

      await expect(teams.updateTeam(formData)).rejects.toThrow("Mannschaft nicht gefunden");
    });
  });

  describe("deleteTeam", () => {
    it("sollte eine Mannschaft löschen", async () => {
      mockDb.select.mockReturnValue(createSelectChain([mockTeam]));
      mockDb.delete.mockReturnValue({
        where: vi.fn(() => Promise.resolve()),
      });

      await teams.deleteTeam("team-1");

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/teams");
    });

    it("sollte Fehler werfen wenn Mannschaft nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      await expect(teams.deleteTeam("non-existent")).rejects.toThrow("Mannschaft nicht gefunden");
    });
  });
});
