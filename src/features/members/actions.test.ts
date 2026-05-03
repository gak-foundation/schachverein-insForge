import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== HOISTED MOCKS =====
const { mockRevalidatePath, mockInsforgeClient, mockRequireClubId, mockLogMemberAction, mockGetSession, tableChains } = vi.hoisted(() => {
  const chains = new Map<string, unknown>();
  return {
    mockRevalidatePath: vi.fn(),
    mockInsforgeClient: { from: vi.fn(), auth: {} as Record<string, unknown>, database: { from: vi.fn() } },
    mockRequireClubId: vi.fn(),
    mockLogMemberAction: vi.fn(),
    mockGetSession: vi.fn(),
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

vi.mock("@/lib/insforge/server-auth", () => ({
  createServerAuthClient: vi.fn(() => Promise.resolve(mockInsforgeClient)),
}));

vi.mock("@/lib/actions/utils", () => ({
  requireClubId: mockRequireClubId,
}));

vi.mock("@/lib/audit", () => ({
  logMemberAction: (...args: unknown[]) => mockLogMemberAction(...args),
}));

vi.mock("@/lib/auth/session", () => ({
  getSession: mockGetSession,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: "test-token" })),
  })),
}));

vi.mock("@/lib/crypto", () => ({
  encrypt: vi.fn((v: string) => `encrypted:${v}`),
  decrypt: vi.fn((v: string) => v.replace("encrypted:", "")),
}));

// ===== IMPORTS =====
import * as members from "./actions";
import { mockFormData } from "@/lib/test/helpers";
import { createMockMember } from "@/lib/test/factories";

function makeChain(returnData: unknown = []) {
  const data = returnData;
  const singleData = Array.isArray(data) ? data[0] ?? null : data;
  const singleErr = singleData ? null : { message: "no rows" };

  const singleThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: singleData, error: singleErr })) };
  const maybeSingleThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: singleData, error: null })) };
  const insertWithSelect = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: null, error: null })) };
  insertWithSelect.select = vi.fn(() => ({
    single: vi.fn(() => ({ then: (r2: (v: unknown) => unknown) => Promise.resolve(r2({ data: { id: "member-1", first_name: "Max", last_name: "Mustermann", email: "max@test.de", status: "active" }, error: null })) })),
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

describe("Member Actions", () => {
  const mockMember = createMockMember();
  const mockMembership = { id: "membership-1", role: "mitglied", club_id: "club-1", member_id: "member-1", status: "active" };

  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
    mockRequireClubId.mockResolvedValue("club-1");
    mockGetSession.mockResolvedValue({ user: { id: "user-1", memberId: "member-1" } });
  });

  describe("createMember", () => {
    it("sollte Zod-Validationsfehler bei ungültigen Daten werfen", async () => {
      const formData = mockFormData({
        firstName: "", lastName: "Mustermann", email: "invalid-email",
      });

      await expect(members.createMember(formData)).rejects.toThrow();
    });

    it("sollte ein Mitglied mit gültigen Daten erstellen", async () => {
      setupTable("members");
      setupTable("club_memberships");
      setupTable("member_status_history");

      const formData = mockFormData({
        firstName: "Max", lastName: "Mustermann", email: "max@example.com", role: "mitglied",
      });

      await members.createMember(formData);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/members");
    });
  });

  describe("deleteMember", () => {
    it("sollte ein Mitglied als inaktiv markieren", async () => {
      setupTable("club_memberships", [mockMembership]);
      setupTable("members", [mockMember]);
      setupTable("member_status_history");

      await members.deleteMember("member-1");
      expect(mockLogMemberAction).toHaveBeenCalled();
    });
  });

  describe("updateMember", () => {
    it("sollte ein Mitglied aktualisieren", async () => {
      setupTable("club_memberships", [mockMembership]);
      setupTable("members", [mockMember]);
      setupTable("member_status_history");

      const formData = mockFormData({
        id: "member-1", firstName: "Maximilian", lastName: "Mustermann",
        email: "max@example.com", status: "active", role: "vorstand",
      });

      await members.updateMember(formData);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/members");
    });
  });

  describe("getMembers", () => {
    it("sollte leere Mitgliederliste zurückgeben", async () => {
      setupTable("club_memberships", []);
      const result = await members.getMembers();
      expect(result.members).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });
});
