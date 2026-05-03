import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== HOISTED MOCKS =====
const { mockInsforgeClient, mockGetSession, mockLogMemberAction, mockRevalidatePath, tableChains } = vi.hoisted(() => {
  const chains = new Map<string, unknown>();
  return {
    mockInsforgeClient: { from: vi.fn(), auth: {} as Record<string, unknown>, database: { from: vi.fn() } },
    mockGetSession: vi.fn(),
    mockLogMemberAction: vi.fn(),
    mockRevalidatePath: vi.fn(),
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

vi.mock("@/lib/auth/session", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/audit", () => ({
  logMemberAction: (...args: unknown[]) => mockLogMemberAction(...args),
}));

vi.mock("@/lib/auth/permissions", () => ({
  PERMISSIONS: { MEMBERS_DELETE: "members.delete", ADMIN_USERS: "admin.users" },
  hasPermission: vi.fn((role: string, perms: string[], perm: string, isSuper?: boolean) => {
    if (isSuper) return true;
    if (perms.includes(perm)) return true;
    return role === "admin" || role === "vorstand";
  }),
}));

// ===== IMPORTS =====
import { requestAccountDeletion, exportMemberData, anonymizeMember } from "./gdpr-actions";

function makeChain(returnData: unknown = []) {
  const data = returnData;
  const singleData = Array.isArray(data) ? data[0] ?? null : data;
  const singleErr = singleData ? null : { message: "no rows" };
  const singleThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: singleData, error: singleErr })) };
  const updateThenable = { then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: null, error: null })) };

  const chain = {
    eq: vi.fn(() => chain), or: vi.fn(() => chain), order: vi.fn(() => chain),
    limit: vi.fn(() => chain), offset: vi.fn(() => chain), range: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(() => singleThenable),
    maybeSingle: vi.fn(() => singleThenable),
    insert: vi.fn(() => ({ then: (r: (v: unknown) => unknown) => Promise.resolve(r({ data: null, error: null })) })),
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

describe("requestAccountDeletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
  });

  it("sollte Fehler werfen wenn nicht eingeloggt", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(requestAccountDeletion()).rejects.toThrow("Nicht autorisiert");
  });

  it("sollte Löschung beantragen", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1", memberId: "member-1" } });
    setupTable("members");

    const result = await requestAccountDeletion();
    expect(result).toEqual({ success: true });
    expect(mockLogMemberAction).toHaveBeenCalledWith("DELETION_REQUESTED", "member-1", expect.anything());
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/settings");
  });
});

describe("exportMemberData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
  });

  it("sollte Fehler werfen wenn nicht eingeloggt", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(exportMemberData("member-1")).rejects.toThrow("Nicht autorisiert");
  });

  it("sollte Fehler werfen wenn fremde ID ohne SuperAdmin", async () => {
    mockGetSession.mockResolvedValue({ user: { memberId: "other-member" } });
    await expect(exportMemberData("member-1")).rejects.toThrow("Nicht autorisiert");
  });

  it("sollte eigene Daten exportieren", async () => {
    mockGetSession.mockResolvedValue({ user: { memberId: "member-1" } });
    const mockMember = {
      id: "member-1", first_name: "Max", last_name: "Mustermann",
      email: "max@test.de", phone: null, date_of_birth: "1990-01-01",
      gender: "m", dwz: 1800, elo: 1900, fide_id: null, joined_at: "2024-01-01",
      club_memberships: [{ id: "m1", club_id: "club-1", role: "mitglied" }],
      dwz_history: [], member_status_history: [],
    };
    setupTable("members", [mockMember]);
    setupTable("payments", [{ id: "p1", amount: "100", status: "paid" }]);

    const result = await exportMemberData("member-1");
    expect(result.personalData.firstName).toBe("Max");
    expect(result.personalData.lastName).toBe("Mustermann");
    expect(result.memberships).toHaveLength(1);
    expect(result.payments).toHaveLength(1);
    expect(result.exportedAt).toBeDefined();
  });

  it("sollte SuperAdmin den Export jeder ID erlauben", async () => {
    mockGetSession.mockResolvedValue({ user: { memberId: "admin-id", isSuperAdmin: true } });
    setupTable("members", [{ id: "member-99", first_name: "Fremd", last_name: "User", club_memberships: [], dwz_history: [], member_status_history: [] }]);
    setupTable("payments", []);

    const result = await exportMemberData("member-99");
    expect(result.personalData.firstName).toBe("Fremd");
  });
});

describe("anonymizeMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
  });

  it("sollte Fehler werfen wenn nicht eingeloggt", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(anonymizeMember("member-1")).rejects.toThrow("Nicht autorisiert");
  });

  it("sollte Fehler werfen ohne Berechtigung", async () => {
    mockGetSession.mockResolvedValue({
      user: { memberId: "m-1", id: "u-1", role: "mitglied", permissions: [], isSuperAdmin: false },
    });
    await expect(anonymizeMember("member-1")).rejects.toThrow("Nur Administratoren mit entsprechenden Rechten");
  });

  it("sollte Mitglied anonymisieren", async () => {
    mockGetSession.mockResolvedValue({
      user: { memberId: "m-1", id: "u-1", role: "admin", permissions: [], isSuperAdmin: false },
    });
    setupTable("members", [{ id: "member-1" }]);
    setupTable("auth_user");
    setupTable("club_memberships");

    const result = await anonymizeMember("member-1");
    expect(result).toEqual({ success: true });
    expect(mockLogMemberAction).toHaveBeenCalledWith("ANONYMIZED", "member-1", {});
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/members");
  });

  it("sollte Fehler werfen wenn Mitglied nicht existiert", async () => {
    mockGetSession.mockResolvedValue({
      user: { memberId: "m-1", id: "u-1", role: "admin", permissions: [], isSuperAdmin: false },
    });
    setupTable("members", []);

    await expect(anonymizeMember("non-existent")).rejects.toThrow("Mitglied nicht gefunden");
  });
});
