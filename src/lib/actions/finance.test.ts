import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== HOISTED MOCKS =====
const { mockRevalidatePath, mockDb, mockRequireClubId, mockLogMemberAction, mockGenerateSepaXML, mockGenerateEndToEndId } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockDb: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      payments: { findMany: vi.fn(), findFirst: vi.fn() },
    },
  },
  mockRequireClubId: vi.fn(),
  mockLogMemberAction: vi.fn(),
  mockGenerateSepaXML: vi.fn(),
  mockGenerateEndToEndId: vi.fn(),
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

vi.mock("@/lib/audit", () => ({
  logMemberAction: (...args: unknown[]) => mockLogMemberAction(...args),
}));

vi.mock("@/lib/sepa/generator", () => ({
  generateSepaXML: mockGenerateSepaXML,
  generateEndToEndId: mockGenerateEndToEndId,
}));

// ===== IMPORTS =====
import * as finance from "./finance";
import { mockFormData } from "@/lib/test/helpers";

describe("Finance Actions", () => {
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

  describe("getPayments", () => {
    it("sollte alle Zahlungen des Vereins zurückgeben", async () => {
      const mockPayments = [
        { id: "payment-1", amount: "100.00", status: "pending" },
        { id: "payment-2", amount: "50.00", status: "paid" },
      ];
      mockDb.select.mockReturnValue(createSelectChain(mockPayments));

      const result = await finance.getPayments();

      expect(result).toEqual(mockPayments);
    });
  });

  describe("createPayment", () => {
    it("sollte eine Zahlung erstellen", async () => {
      mockDb.select.mockReturnValue(createSelectChain([{ id: "membership-1" }]));
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      const formData = mockFormData({
        memberId: "member-1",
        amount: "100",
        description: "Mitgliedsbeitrag 2024",
        year: "2024",
      });

      await finance.createPayment(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/finance");
    });

    it("sollte Fehler werfen wenn Mitglied nicht im Verein", async () => {
      mockDb.select.mockReturnValue(createSelectChain([]));

      const formData = mockFormData({
        memberId: "member-1",
        amount: "100",
        description: "Test",
        year: "2024",
      });

      await expect(finance.createPayment(formData)).rejects.toThrow("Mitglied ist nicht im Verein");
    });
  });

  describe("getPaymentStats", () => {
    it("sollte Zahlungsstatistiken zurückgeben", async () => {
      mockDb.select.mockReturnValue(createSelectChain([{ count: 10, total: "1500.00" }]));

      const result = await finance.getPaymentStats();

      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("pending");
      expect(result).toHaveProperty("paid");
      expect(result).toHaveProperty("overdue");
    });
  });

  describe("getContributionRates", () => {
    it("sollte alle Beitragssätze zurückgeben", async () => {
      const mockRates = [
        { id: "rate-1", name: "Standard", amount: "120.00" },
        { id: "rate-2", name: "Ermäßigt", amount: "60.00" },
      ];
      mockDb.select.mockReturnValue(createSelectChain(mockRates));

      const result = await finance.getContributionRates();

      expect(result).toEqual(mockRates);
    });
  });
});
