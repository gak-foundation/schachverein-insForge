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
import * as events from "./actions";
import { mockFormData } from "@/lib/test/helpers";
import { createMockEvent } from "@/lib/test/factories";

function makeChain(returnData: unknown = []) {
  const data = returnData;
  const singleData = Array.isArray(data) ? data[0] ?? null : data;
  const err = singleData ? null : { message: "no rows" };
  const singleThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: singleData, error: err })) };
  const insertThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: null, error: null })) };
  const updateThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: null, error: null })) };

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
    return tableChains.get(t) || makeChain([]);
  });
  return chain;
}

describe("Event Actions", () => {
  const mockEvent = createMockEvent();

  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
    mockRequireClubId.mockResolvedValue("club-1");
  });

  describe("getEvents", () => {
    it("sollte alle Events des Vereins zurückgeben", async () => {
      setupTable("events", [mockEvent]);

      const result = await events.getEvents();
      expect(result).toEqual([mockEvent]);
    });
  });

  describe("createEvent", () => {
    it("sollte ein Event mit gültigen Daten erstellen", async () => {
      setupTable("events");

      const formData = mockFormData({
        title: "Neues Event", eventType: "club_evening",
        startDate: "2024-06-01", location: "Vereinsheim", isAllDay: "false",
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
      setupTable("seasons", mockSeasons);

      const result = await events.getSeasons();
      expect(result).toEqual(mockSeasons);
    });
  });

  describe("createSeason", () => {
    it("sollte eine Saison mit gültigen Daten erstellen", async () => {
      setupTable("seasons");

      const formData = mockFormData({
        name: "Saison 2024/25", year: "2024", type: "club_internal",
        startDate: "2024-09-01", endDate: "2025-06-30",
      });

      await events.createSeason(formData);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/seasons");
    });
  });

  describe("getEventById", () => {
    it("sollte ein Event anhand der ID zurückgeben", async () => {
      setupTable("events", [mockEvent]);

      const result = await events.getEventById("event-1");
      expect(result).toEqual(mockEvent);
    });

    it("sollte undefined zurückgeben wenn Event nicht gefunden", async () => {
      setupTable("events", []);

      const result = await events.getEventById("non-existent");
      expect(result).toBeUndefined();
    });
  });
});
