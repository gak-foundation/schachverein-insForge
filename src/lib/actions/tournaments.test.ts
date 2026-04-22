import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== HOISTED MOCKS =====
const { mockRevalidatePath, mockDb, mockRequireClubId, mockGenerateRoundRobinPairings, mockGenerateSwissPairings, mockGenerateTRFFromTournament } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockDb: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      tournamentParticipants: { findMany: vi.fn() },
      games: { findMany: vi.fn(), findFirst: vi.fn() },
    },
  },
  mockRequireClubId: vi.fn(),
  mockGenerateRoundRobinPairings: vi.fn(),
  mockGenerateSwissPairings: vi.fn(),
  mockGenerateTRFFromTournament: vi.fn(),
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

vi.mock("@/lib/pairings/round-robin", () => ({
  generateRoundRobinPairings: mockGenerateRoundRobinPairings,
}));

vi.mock("@/lib/pairings/swiss", () => ({
  generateSwissPairings: mockGenerateSwissPairings,
}));

vi.mock("@/lib/trf/generator", () => ({
  generateTRFFromTournament: mockGenerateTRFFromTournament,
}));

// ===== IMPORTS =====
import * as tournaments from "./tournaments";
import { mockFormData } from "@/lib/test/helpers";
import { createMockTournament, createMockTournamentParticipant } from "@/lib/test/factories";

describe("Tournament Actions", () => {
  const mockTournament = createMockTournament();
  const mockParticipant = createMockTournamentParticipant();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireClubId.mockResolvedValue("club-1");
  });

  // Helper to create chainable select mock
  function createSelectChain(returnValue: unknown) {
    const chain = {
      where: vi.fn(() => chain),
      orderBy: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      offset: vi.fn(() => chain),
      innerJoin: vi.fn(() => chain),
      then: vi.fn((cb: (val: unknown) => unknown) => Promise.resolve(cb(returnValue))),
    };
    return { from: vi.fn(() => chain) };
  }

  describe("getTournaments", () => {
    it("sollte alle Turniere des Vereins zurückgeben", async () => {
      const mockTournaments = [mockTournament];
      mockDb.select.mockReturnValue(createSelectChain(mockTournaments));

      const result = await tournaments.getTournaments();

      expect(result).toEqual(mockTournaments);
    });
  });

  describe("getTournamentById", () => {
    it("sollte ein Turnier anhand der ID zurückgeben", async () => {
      mockDb.select.mockReturnValue(createSelectChain([mockTournament]));

      const result = await tournaments.getTournamentById("tournament-1");

      expect(result).toEqual(mockTournament);
    });

    it("sollte null zurückgeben wenn Turnier nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      const result = await tournaments.getTournamentById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("createTournament", () => {
    it("sollte ein Turnier mit gültigen Daten erstellen", async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      const formData = mockFormData({
        name: "Neues Turnier",
        type: "swiss",
        startDate: "2024-06-01",
      });

      await tournaments.createTournament(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte mit Saison ein Turnier erstellen", async () => {
      mockDb.select.mockReturnValue(createSelectChain([{ id: "season-1" }]));
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      const formData = mockFormData({
        name: "Neues Turnier",
        type: "swiss",
        startDate: "2024-06-01",
        seasonId: "season-1",
      });

      await tournaments.createTournament(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte Fehler werfen wenn Saison nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      const formData = mockFormData({
        name: "Neues Turnier",
        type: "swiss",
        startDate: "2024-06-01",
        seasonId: "non-existent-season",
      });

      await expect(tournaments.createTournament(formData)).rejects.toThrow("Saison nicht gefunden");
    });
  });

  describe("updateTournament", () => {
    it("sollte ein Turnier aktualisieren", async () => {
      mockDb.select.mockReturnValue(createSelectChain([mockTournament]));
      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      });

      const formData = mockFormData({
        id: "tournament-1",
        name: "Aktualisiertes Turnier",
        startDate: "2024-06-01",
      });

      await tournaments.updateTournament(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte Fehler werfen wenn Turnier nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      const formData = mockFormData({
        id: "non-existent",
        name: "Turnier",
        startDate: "2024-06-01",
      });

      await expect(tournaments.updateTournament(formData)).rejects.toThrow("Turnier nicht gefunden");
    });
  });

  describe("deleteTournament", () => {
    it("sollte ein Turnier löschen", async () => {
      mockDb.select.mockReturnValue(createSelectChain([mockTournament]));
      mockDb.delete.mockReturnValue({
        where: vi.fn(() => Promise.resolve()),
      });

      await tournaments.deleteTournament("tournament-1");

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte Fehler werfen wenn Turnier nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      await expect(tournaments.deleteTournament("non-existent")).rejects.toThrow("Turnier nicht gefunden");
    });
  });

  describe("getTournamentParticipants", () => {
    it("sollte Teilnehmer eines Turniers zurückgeben", async () => {
      const mockParticipants = [mockParticipant];
      mockDb.select.mockReturnValue(createSelectChain([mockTournament]));
      mockDb.query.tournamentParticipants.findMany.mockResolvedValue(mockParticipants);

      const result = await tournaments.getTournamentParticipants("tournament-1");

      expect(result).toEqual(mockParticipants);
    });

    it("sollte Fehler werfen wenn Turnier nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      await expect(tournaments.getTournamentParticipants("non-existent")).rejects.toThrow("Turnier nicht gefunden");
    });
  });

  describe("addTournamentParticipant", () => {
    it("sollte einen Teilnehmer hinzufügen", async () => {
      mockDb.select
        .mockReturnValueOnce(createSelectChain([mockTournament]))
        .mockReturnValueOnce(createSelectChain([{ id: "membership-1" }]));
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      const formData = mockFormData({
        tournamentId: "tournament-1",
        memberId: "member-1",
      });

      await tournaments.addTournamentParticipant(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte Fehler werfen wenn Mitglied nicht im Verein", async () => {
      mockDb.select
        .mockReturnValueOnce(createSelectChain([mockTournament]))
        .mockReturnValueOnce(createSelectChain([])); // No membership

      const formData = mockFormData({
        tournamentId: "tournament-1",
        memberId: "member-1",
      });

      await expect(tournaments.addTournamentParticipant(formData)).rejects.toThrow("Mitglied ist nicht im Verein");
    });
  });

  describe("removeTournamentParticipant", () => {
    it("sollte einen Teilnehmer entfernen", async () => {
      mockDb.select.mockReturnValueOnce(createSelectChain([{ tournamentId: "tournament-1" }]))
        .mockReturnValueOnce(createSelectChain([mockTournament]));
      mockDb.delete.mockReturnValue({
        where: vi.fn(() => Promise.resolve()),
      });

      await tournaments.removeTournamentParticipant("participant-1");

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte Fehler werfen wenn Teilnehmer nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      await expect(tournaments.removeTournamentParticipant("non-existent")).rejects.toThrow("Teilnehmer nicht gefunden");
    });
  });

  describe("generateRoundRobinRounds", () => {
    it("sollte Fehler werfen bei ungültigem Turniertyp", async () => {
      const swissTournament = createMockTournament({ type: "swiss" });
      mockDb.select.mockReturnValue(createSelectChain([swissTournament]));

      await expect(tournaments.generateRoundRobinRounds("tournament-1")).rejects.toThrow("Nur für Rundenturnier und Vereinsmeisterschaft verfügbar");
    });

    it("sollte Fehler werfen bei zu wenigen Teilnehmern", async () => {
      const roundRobinTournament = createMockTournament({ type: "round_robin" });
      
      mockDb.select.mockReturnValueOnce(createSelectChain([roundRobinTournament]))
        .mockReturnValueOnce(createSelectChain([])); // Leere Teilnehmerliste
      mockDb.query.games.findMany.mockResolvedValue([]);

      await expect(tournaments.generateRoundRobinRounds("tournament-1")).rejects.toThrow("Mindestens 2 Teilnehmer erforderlich");
    });
  });

  describe("updateTournamentResults", () => {
    it("sollte Ergebnisse aktualisieren", async () => {
      mockDb.select.mockReturnValueOnce(createSelectChain([mockTournament]))
        .mockReturnValueOnce(createSelectChain([mockParticipant]));
      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      });

      await tournaments.updateTournamentResults("tournament-1", [
        { id: "participant-1", memberId: "member-1", score: "3.5" },
      ]);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tournaments");
    });

    it("sollte Fehler werfen wenn Turnier nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      await expect(tournaments.updateTournamentResults("non-existent", [])).rejects.toThrow("Turnier nicht gefunden");
    });
  });

  describe("importTRF", () => {
    it("sollte TRF Daten importieren", async () => {
      mockDb.select.mockReturnValue(createSelectChain([mockTournament]));
      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      });

      const result = await tournaments.importTRF("tournament-1", "001 Test Player\n026 1 0001 0002 1");

      expect(result.success).toBe(true);
      expect(result.imported.players).toBe(1);
    });
  });

  describe("generateSwissRound", () => {
    it("sollte Schweizer Runde generieren", async () => {
      const swissTournament = createMockTournament({ type: "swiss", numberOfRounds: 7 });
      
      mockDb.select.mockReturnValue(createSelectChain([swissTournament]));
      mockDb.query.games.findMany.mockResolvedValue([]);
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });
      mockGenerateTRFFromTournament.mockResolvedValue("TRF DATA");
      mockGenerateSwissPairings.mockResolvedValue({
        success: true,
        pairings: [{ whiteId: "0001", blackId: "0002", board: 1 }],
      });

      const result = await tournaments.generateSwissRound("tournament-1");

      expect(result.success).toBe(true);
      expect(result).toHaveProperty("jobId");
      expect(result.message).toContain("Die Auslosung wurde gestartet");
    });

    it("sollte Fehler werfen bei ungültigem Turniertyp", async () => {
      const roundRobinTournament = createMockTournament({ type: "round_robin" });
      mockDb.select.mockReturnValue(createSelectChain([roundRobinTournament]));

      await expect(tournaments.generateSwissRound("tournament-1")).rejects.toThrow("Nur für Schweizer System verfügbar");
    });
  });
});
