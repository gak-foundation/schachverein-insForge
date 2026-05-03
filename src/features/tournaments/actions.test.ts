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

vi.mock("@/lib/pairings/round-robin", () => ({
  generateRoundRobinPairings: vi.fn(() => ({ success: true, pairings: [] })),
}));

vi.mock("@/lib/pairings/swiss", () => ({
  generateSwissPairings: vi.fn(() => ({ success: true, pairings: [] })),
}));

vi.mock("@/lib/trf/generator", () => ({
  generateTRFFromTournament: vi.fn(() => "TRF DATA"),
}));

// ===== IMPORTS =====
import * as tournaments from "./actions";
import { mockFormData } from "@/lib/test/helpers";
import { createMockTournament } from "@/lib/test/factories";

function makeChain(returnData: unknown = []) {
  const data = returnData;
  const singleData = Array.isArray(data) ? data[0] ?? null : data;
  const singleErr = singleData ? null : { message: "no rows" };
  const singleThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: singleData, error: singleErr })) };
  const maybeSingleThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: singleData, error: null })) };
  const insertWithSelect = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: null, error: null })) };
  insertWithSelect.select = vi.fn(() => ({
    single: vi.fn(() => ({ then: (r2: (v: unknown) => unknown) => Promise.resolve(r2({ data: { id: "new-id" }, error: null })) })),
  }));

  const chain = {
    eq: vi.fn(() => chain), or: vi.fn(() => chain), order: vi.fn(() => chain),
    limit: vi.fn(() => chain), offset: vi.fn(() => chain), range: vi.fn(() => chain),
    not: vi.fn(() => chain), gte: vi.fn(() => chain), lte: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(() => singleThenable),
    maybeSingle: vi.fn(() => maybeSingleThenable),
    insert: vi.fn(() => insertWithSelect),
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

describe("Tournament Actions", () => {
  const mockTournament = createMockTournament();

  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
    mockRequireClubId.mockResolvedValue("club-1");
  });

  describe("getTournaments", () => {
    it("sollte alle Turniere des Vereins zurückgeben", async () => {
      const dbData = [{
        id: mockTournament.id, name: mockTournament.name, type: mockTournament.type,
        start_date: mockTournament.startDate, location: mockTournament.location,
        is_completed: mockTournament.isCompleted,
      }];
      setupTable("tournaments", dbData);

      const result = await tournaments.getTournaments();
      expect(result).toEqual([{
        id: mockTournament.id, name: mockTournament.name, type: mockTournament.type,
        startDate: mockTournament.startDate, location: mockTournament.location,
        isCompleted: mockTournament.isCompleted,
      }]);
    });
  });

  describe("getTournamentById", () => {
    it("sollte ein Turnier anhand der ID zurückgeben", async () => {
      setupTable("tournaments", [mockTournament]);

      const result = await tournaments.getTournamentById("tournament-1");
      expect(result).toEqual(mockTournament);
    });

    it("sollte null zurückgeben wenn Turnier nicht gefunden", async () => {
      setupTable("tournaments", []);

      const result = await tournaments.getTournamentById("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("createTournament", () => {
    it("sollte ein Turnier mit gültigen Daten erstellen", async () => {
      setupTable("tournaments");

      const formData = mockFormData({
        name: "Neues Turnier", type: "swiss", startDate: "2024-06-01",
      });

      await tournaments.createTournament(formData);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte mit Saison ein Turnier erstellen", async () => {
      setupTable("seasons", [{ id: "season-1" }]);
      setupTable("tournaments");

      const formData = mockFormData({
        name: "Neues Turnier", type: "swiss", startDate: "2024-06-01", seasonId: "season-1",
      });

      await tournaments.createTournament(formData);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte Fehler werfen wenn Saison nicht gefunden", async () => {
      setupTable("seasons", []);

      const formData = mockFormData({
        name: "Neues Turnier", type: "swiss", startDate: "2024-06-01", seasonId: "non-existent-season",
      });

      await expect(tournaments.createTournament(formData)).rejects.toThrow("Saison nicht gefunden");
    });
  });

  describe("updateTournament", () => {
    it("sollte ein Turnier aktualisieren", async () => {
      setupTable("tournaments", [mockTournament]);

      const formData = mockFormData({
        id: "tournament-1", name: "Aktualisiertes Turnier", startDate: "2024-06-01",
      });

      await tournaments.updateTournament(formData);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte Fehler werfen wenn Turnier nicht gefunden", async () => {
      setupTable("tournaments", []);

      const formData = mockFormData({
        id: "non-existent", name: "Turnier", startDate: "2024-06-01",
      });

      await expect(tournaments.updateTournament(formData)).rejects.toThrow("Turnier nicht gefunden");
    });
  });

  describe("deleteTournament", () => {
    it("sollte ein Turnier löschen", async () => {
      setupTable("tournaments", [mockTournament]);

      await tournaments.deleteTournament("tournament-1");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte Fehler werfen wenn Turnier nicht gefunden", async () => {
      setupTable("tournaments", []);

      await expect(tournaments.deleteTournament("non-existent")).rejects.toThrow("Turnier nicht gefunden");
    });
  });

  describe("importTRF", () => {
    it("sollte TRF Daten importieren", async () => {
      setupTable("tournaments", [mockTournament]);

      const result = await tournaments.importTRF("tournament-1", "001 Test Player");
      expect(result.success).toBe(true);
    });
  });
});
