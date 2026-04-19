import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== HOISTED MOCKS =====
const { mockRevalidatePath, mockDb, mockRequireClubId, mockLogMemberAction, mockGetSession } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockDb: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      members: { findMany: vi.fn(), findFirst: vi.fn() },
      clubMemberships: { findMany: vi.fn(), findFirst: vi.fn() },
    },
  },
  mockRequireClubId: vi.fn(),
  mockLogMemberAction: vi.fn(),
  mockGetSession: vi.fn(),
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

vi.mock("@/lib/auth/session", () => ({
  getSession: mockGetSession,
}));

// ===== IMPORTS =====
import * as members from "./members";
import { mockFormData } from "@/lib/test/helpers";
import { createMockMember, createMockClubMembership } from "@/lib/test/factories";

describe("Member Actions", () => {
  const mockMember = createMockMember();
  const mockMembership = createMockClubMembership();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireClubId.mockResolvedValue("club-1");
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
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

  describe("createMember", () => {
    it("sollte Zod-Validationsfehler bei ungültigen Daten werfen", async () => {
      const formData = mockFormData({
        firstName: "",
        lastName: "Mustermann",
        email: "invalid-email",
      });

      await expect(members.createMember(formData)).rejects.toThrow();
    });

    it("sollte ein Mitglied mit gültigen Daten erstellen", async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: "member-1" }])),
        })),
      });

      const formData = mockFormData({
        firstName: "Max",
        lastName: "Mustermann",
        email: "max@example.com",
        role: "mitglied",
      });

      await members.createMember(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/members");
    });
  });

  describe("deleteMember", () => {
    it("sollte ein Mitglied als inaktiv markieren", async () => {
      mockDb.select.mockReturnValue(createSelectChain([mockMember, mockMembership]));
      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      });

      await members.deleteMember("member-1");

      expect(mockLogMemberAction).toHaveBeenCalled();
    });
  });

  describe("updateMember", () => {
    it("sollte ein Mitglied aktualisieren", async () => {
      // First mock for checking membership
      // Second mock for getMemberById to return current member
      mockDb.select
        .mockReturnValueOnce(createSelectChain([mockMembership]))
        .mockReturnValueOnce(createSelectChain([mockMembership]));
      
      mockDb.query.members.findFirst.mockResolvedValue(mockMember);
      
      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      });

      const formData = mockFormData({
        id: "member-1",
        firstName: "Maximilian",
        lastName: "Mustermann",
        email: "max@example.com",
        status: "active",
        role: "vorstand",
      });

      await members.updateMember(formData);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/members");
    });
  });

  describe("getMembers", () => {
    it("sollte Mitglieder mit Pagination zurückgeben", async () => {
      const mockMembersData = { members: [mockMember], totalCount: 1, totalPages: 1 };
      // getMembers makes 2 queries - one for data, one for count
      mockDb.select
        .mockReturnValueOnce(createSelectChain([mockMember]))
        .mockReturnValueOnce(createSelectChain([{ count: 1 }]));

      const result = await members.getMembers();

      expect(result).toEqual(mockMembersData);
    });

    it("sollte Mitglieder nach Name filtern", async () => {
      const mockMembersData = { members: [mockMember], totalCount: 1, totalPages: 1 };
      mockDb.select
        .mockReturnValueOnce(createSelectChain([mockMember]))
        .mockReturnValueOnce(createSelectChain([{ count: 1 }]));

      const result = await members.getMembers("Max");

      expect(result).toEqual(mockMembersData);
    });

    it("sollte Mitglieder nach Rolle filtern", async () => {
      const mockMembersData = { members: [mockMember], totalCount: 1, totalPages: 1 };
      mockDb.select
        .mockReturnValueOnce(createSelectChain([mockMember]))
        .mockReturnValueOnce(createSelectChain([{ count: 1 }]));

      const result = await members.getMembers(undefined, "vorstand");

      expect(result).toEqual(mockMembersData);
    });
  });
});
