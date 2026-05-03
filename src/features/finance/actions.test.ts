import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== HOISTED MOCKS =====
const { mockRevalidatePath, mockInsforgeClient, mockRequireClubId, mockLogMemberAction, tableChains } = vi.hoisted(() => {
  const chains = new Map<string, unknown>();
  return {
    mockRevalidatePath: vi.fn(),
    mockInsforgeClient: { from: vi.fn(), auth: {} as Record<string, unknown>, database: { from: vi.fn() } },
    mockRequireClubId: vi.fn(),
    mockLogMemberAction: vi.fn(),
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

vi.mock("@/lib/audit", () => ({
  logMemberAction: (...args: unknown[]) => mockLogMemberAction(...args),
}));

vi.mock("@/lib/sepa/generator", () => ({
  generateSepaXML: vi.fn(() => "<xml/>"),
  generateEndToEndId: vi.fn(() => "E2E-001"),
}));

// ===== IMPORTS =====
import * as finance from "./actions";
import { mockFormData } from "@/lib/test/helpers";

function makeInsertWithSelect(returnData = [{ id: "new-id" }]) {
  const single = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: returnData[0] ?? null, error: null })) };
  const select = vi.fn(() => ({ single: vi.fn(() => single) }));
  const thenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: returnData, error: null })) };
  thenable.select = select;
  return thenable;
}

function makeChain(returnData: unknown = []) {
  const data = returnData;
  const singleData = Array.isArray(data) ? data[0] ?? null : data;
  const singleErr = singleData ? null : { message: "no rows" };
  const singleThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: singleData, error: singleErr })) };

  const chain = {
    eq: vi.fn(() => chain), or: vi.fn(() => chain), order: vi.fn(() => chain),
    limit: vi.fn(() => chain), offset: vi.fn(() => chain), range: vi.fn(() => chain),
    not: vi.fn(() => chain), gte: vi.fn(() => chain), lte: vi.fn(() => chain),
    lt: vi.fn(() => chain), in: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(() => singleThenable),
    maybeSingle: vi.fn(() => singleThenable),
    insert: vi.fn(() => makeInsertWithSelect()),
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

describe("Finance Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
    mockRequireClubId.mockResolvedValue("club-1");
  });

  describe("getPayments", () => {
    it("sollte alle Zahlungen des Vereins zurückgeben", async () => {
      const mockPayments = [
        { id: "payment-1", member_id: "m-1", amount: "100.00", description: "Beitrag", status: "pending", due_date: null, year: 2024, sepa_mandate_reference: null, invoice_number: null, dunning_level: 0 },
        { id: "payment-2", member_id: "m-2", amount: "50.00", description: "Beitrag", status: "paid", due_date: null, year: 2024, sepa_mandate_reference: null, invoice_number: null, dunning_level: 0 },
      ];
      setupTable("payments", mockPayments);

      const result = await finance.getPayments();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe("payment-1");
    });
  });

  describe("createPayment", () => {
    it("sollte eine Zahlung erstellen", async () => {
      setupTable("club_memberships", [{ id: "membership-1", member_id: "member-1", club_id: "club-1" }]);
      setupTable("payments");
      setupTable("members", [{ id: "member-1", first_name: "Max", last_name: "Mustermann", email: "max@test.de" }]);
      setupTable("clubs", [{ id: "club-1", name: "Test Club" }]);

      const formData = mockFormData({
        memberId: "member-1", amount: "100",
        description: "Mitgliedsbeitrag 2024", year: "2024",
      });

      await finance.createPayment(formData);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/finance");
    });
  });

  describe("getContributionRates", () => {
    it("sollte alle Beitragssätze zurückgeben", async () => {
      const mockRates = [
        { id: "rate-1", name: "Standard", amount: "120.00" },
        { id: "rate-2", name: "Ermäßigt", amount: "60.00" },
      ];
      setupTable("contribution_rates", mockRates);

      const result = await finance.getContributionRates();
      expect(result).toEqual(mockRates);
    });
  });
});
