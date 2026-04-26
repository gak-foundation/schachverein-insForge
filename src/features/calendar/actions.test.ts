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
      events: { findMany: vi.fn(), findFirst: vi.fn() },
      seasons: { findMany: vi.fn(), findFirst: vi.fn() },
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
import * as events from "./actions";
import { mockFormData } from "@/lib/test/helpers";
import { createMockEvent } from "@/lib/test/factories";

describe("Event Actions", () => {
  const mockEvent = createMockEvent();

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

  describe("getEvents", () => {
    it("sollte alle Events des Vereins zurückgeben", async () => {
      const mockEvents = [mockEvent];
      mockDb.select.mockReturnValue(createSelectChain(mockEvents));

      const result = await events.getEvents();

      expect(result).toEqual(mockEvents);
    });
  });

  describe("createEvent", () => {
    it("sollte ein Event mit gültigen Daten erstellen", async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      const formData = mockFormData({
        title: "Neues Event",
        eventType: "club_evening",
        startDate: "2024-06-01",
        location: "Vereinsheim",
        isAllDay: "false",
      });

      await events.createEvent(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/calendar");
    });
  });

  describe("getSeasons", () => {
    it("sollte alle Saisons des Vereins zurückgeben", async () => {
      const mockSeasons = [
        { id: "season-1", name: "2024/25", year: 2024 },
        { id: "season-2", name: "2023/24", year: 2023 },
      ];
      mockDb.select.mockReturnValue(createSelectChain(mockSeasons));

      const result = await events.getSeasons();

      expect(result).toEqual(mockSeasons);
    });
  });

  describe("createSeason", () => {
    it("sollte eine Saison mit gültigen Daten erstellen", async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      const formData = mockFormData({
        name: "Saison 2024/25",
        year: "2024",
        type: "club_internal",
        startDate: "2024-09-01",
        endDate: "2025-06-30",
      });

      await events.createSeason(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/seasons");
    });
  });

  describe("getEventById", () => {
    it("sollte ein Event anhand der ID zurückgeben", async () => {
      mockDb.select.mockReturnValue(createSelectChain([mockEvent]));

      const result = await events.getEventById("event-1");

      expect(result).toEqual(mockEvent);
    });

    it("sollte undefined zurückgeben wenn Event nicht gefunden", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      const result = await events.getEventById("non-existent");

      expect(result).toBeUndefined();
    });
  });
});
