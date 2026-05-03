import { describe, it, expect, vi, beforeEach } from "vitest";

// ===== HOISTED MOCKS =====
const { mockInsforgeClient, mockSetAuthCookies, mockClearAuthCookies, mockEnsureAuthUser, mockRedirect, tableChains } = vi.hoisted(() => {
  const chains = new Map<string, unknown>();
  const redirectErr = (url: string) => {
    const err = new Error("NEXT_REDIRECT");
    (err as any).digest = `NEXT_REDIRECT${url}`;
    throw err;
  };
  return {
    mockInsforgeClient: { from: vi.fn(), auth: {} as Record<string, unknown>, database: { from: vi.fn() } },
    mockSetAuthCookies: vi.fn(),
    mockClearAuthCookies: vi.fn(),
    mockEnsureAuthUser: vi.fn(),
    mockRedirect: vi.fn((url: string) => redirectErr(url)),
    tableChains: chains,
  };
});

// ===== MODULE MOCKS =====
vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

vi.mock("@/lib/insforge", () => ({
  createClient: vi.fn(() => mockInsforgeClient),
  createServerClient: vi.fn(() => mockInsforgeClient),
  createServiceClient: vi.fn(() => mockInsforgeClient),
  INSFORGE_URL: "https://test.insforge.dev",
}));

vi.mock("@/lib/insforge/server-auth", () => ({
  setAuthCookies: (...args: unknown[]) => mockSetAuthCookies(...args),
  clearAuthCookies: vi.fn(() => mockClearAuthCookies()),
}));

vi.mock("@/lib/db/queries/auth", () => ({
  ensureAuthUser: (...args: unknown[]) => mockEnsureAuthUser(...args),
  getAuthUserWithClub: vi.fn(() => Promise.resolve({ clubId: null })),
}));

// ===== IMPORTS =====
import { loginAction, signupAction, logoutAction, resetPassword } from "./actions";

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
    mockInsforgeClient.auth = { signInWithPassword: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), resetPassword: vi.fn() };
  });

  it("sollte Fehler bei fehlender E-Mail zurückgeben", async () => {
    const fd = new FormData();
    fd.set("password", "secret123");
    const result = await loginAction(fd);
    expect(result).toEqual({ error: "E-Mail und Passwort sind erforderlich" });
  });

  it("sollte Fehler bei fehlendem Passwort zurückgeben", async () => {
    const fd = new FormData();
    fd.set("email", "test@test.de");
    const result = await loginAction(fd);
    expect(result).toEqual({ error: "E-Mail und Passwort sind erforderlich" });
  });

  it("sollte erfolgreichen Login durchführen und weiterleiten", async () => {
    mockInsforgeClient.auth.signInWithPassword = vi.fn(() =>
      Promise.resolve({ data: { accessToken: "at", refreshToken: "rt", user: { id: "u1", email: "test@test.de" } }, error: null })
    );
    mockEnsureAuthUser.mockResolvedValue({ id: "u1" });

    const fd = new FormData();
    fd.set("email", "test@test.de");
    fd.set("password", "secret123");

    await expect(loginAction(fd)).rejects.toThrow();
    expect(mockRedirect).toHaveBeenCalledWith("/onboarding");
    expect(mockSetAuthCookies).toHaveBeenCalledWith("at", "rt");
    expect(mockEnsureAuthUser).toHaveBeenCalled();
  });

  it("sollte eigenen redirectTo verwenden", async () => {
    mockInsforgeClient.auth.signInWithPassword = vi.fn(() =>
      Promise.resolve({ data: { accessToken: "at", refreshToken: "rt", user: { id: "u1", email: "a@b.de" } }, error: null })
    );
    mockEnsureAuthUser.mockResolvedValue({ id: "u1" });

    const fd = new FormData();
    fd.set("email", "a@b.de");
    fd.set("password", "secret123");
    fd.set("redirect", "/dashboard/members");

    await expect(loginAction(fd)).rejects.toThrow();
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard/members");
  });

  it("sollte Fehler bei ungültigen Anmeldedaten zurückgeben", async () => {
    mockInsforgeClient.auth.signInWithPassword = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: "Invalid login credentials" } })
    );

    const fd = new FormData();
    fd.set("email", "wrong@test.de");
    fd.set("password", "wrong");
    const result = await loginAction(fd);
    expect(result).toEqual({ error: "Ungültige E-Mail oder Passwort" });
  });

  it("sollte Fehler bei nicht bestätigter E-Mail zurückgeben", async () => {
    mockInsforgeClient.auth.signInWithPassword = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: "Email not confirmed" } })
    );

    const fd = new FormData();
    fd.set("email", "unverified@test.de");
    fd.set("password", "secret123");
    const result = await loginAction(fd);
    expect(result).toEqual({ error: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse" });
  });

  it("sollte generischen Auth-Fehler weitergeben", async () => {
    mockInsforgeClient.auth.signInWithPassword = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: "Account gesperrt" } })
    );

    const fd = new FormData();
    fd.set("email", "locked@test.de");
    fd.set("password", "secret123");
    const result = await loginAction(fd);
    expect(result).toEqual({ error: "Account gesperrt" });
  });

  it("sollte Fehler bei fehlendem Token behandeln", async () => {
    mockInsforgeClient.auth.signInWithPassword = vi.fn(() =>
      Promise.resolve({ data: { accessToken: null, refreshToken: null, user: { id: "u1", email: "a@b.de" } }, error: null })
    );

    const fd = new FormData();
    fd.set("email", "a@b.de");
    fd.set("password", "secret123");
    const result = await loginAction(fd);
    expect(result).toEqual({ error: "Anmeldung fehlgeschlagen" });
  });
});

describe("signupAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
    mockInsforgeClient.auth = { signInWithPassword: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), resetPassword: vi.fn() };
  });

  it("sollte Fehler bei fehlenden Pflichtfeldern zurückgeben", async () => {
    const fd = new FormData();
    fd.set("email", "test@test.de");
    const result = await signupAction(fd);
    expect(result).toEqual({ error: "E-Mail und Passwort sind erforderlich" });
  });

  it("sollte Fehler bei kurzem Passwort zurückgeben", async () => {
    const fd = new FormData();
    fd.set("email", "test@test.de");
    fd.set("password", "kurz");
    const result = await signupAction(fd);
    expect(result).toEqual({ error: "Passwort muss mindestens 8 Zeichen haben" });
  });

  it("sollte erfolgreiche Registrierung ohne requireEmailVerification durchführen", async () => {
    mockInsforgeClient.auth.signUp = vi.fn(() =>
      Promise.resolve({
        data: { user: { id: "u1", email: "new@test.de" }, accessToken: "at", refreshToken: "rt", requireEmailVerification: false },
        error: null,
      })
    );
    mockEnsureAuthUser.mockResolvedValue({ id: "u1" });

    const fd = new FormData();
    fd.set("email", "new@test.de");
    fd.set("password", "langgenug123");

    await expect(signupAction(fd)).rejects.toThrow();
    expect(mockRedirect).toHaveBeenCalledWith("/auth/verify-email");
    expect(mockSetAuthCookies).toHaveBeenCalledWith("at", "rt");
  });

  it("sollte Fehler vom Auth-Provider weitergeben", async () => {
    mockInsforgeClient.auth.signUp = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: "Email already registered" } })
    );

    const fd = new FormData();
    fd.set("email", "existing@test.de");
    fd.set("password", "langgenug123");
    const result = await signupAction(fd);
    expect(result).toEqual({ error: "Email already registered" });
  });

  it("sollte Name aus E-Mail ableiten", async () => {
    mockInsforgeClient.auth.signUp = vi.fn((opts: { email: string }) =>
      Promise.resolve({
        data: { user: { id: "u1", email: opts.email }, accessToken: "at", refreshToken: "rt", requireEmailVerification: false },
        error: null,
      })
    );
    mockEnsureAuthUser.mockResolvedValue({ id: "u1" });

    const fd = new FormData();
    fd.set("email", "maxmustermann@test.de");
    fd.set("password", "langgenug123");

    await expect(signupAction(fd)).rejects.toThrow();
    expect(mockEnsureAuthUser).toHaveBeenCalledWith(expect.objectContaining({ name: "maxmustermann" }));
  });
});

describe("logoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
  });

  it("sollte Cookies löschen und weiterleiten", async () => {
    mockClearAuthCookies.mockResolvedValue(undefined);
    mockInsforgeClient.auth.signOut = vi.fn(() => Promise.resolve({ error: null }));

    await expect(logoutAction()).rejects.toThrow();
    expect(mockClearAuthCookies).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("sollte auch bei signOut-Fehler Cookies löschen", async () => {
    mockClearAuthCookies.mockResolvedValue(undefined);
    mockInsforgeClient.auth.signOut = vi.fn(() => Promise.reject(new Error("netzwerk")));

    await expect(logoutAction()).rejects.toThrow();
    expect(mockClearAuthCookies).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });
});

describe("resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableChains.clear();
    mockInsforgeClient.auth = { signInWithPassword: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), resetPassword: vi.fn() };
  });

  it("sollte Fehler bei fehlendem Passwort zurückgeben", async () => {
    const fd = new FormData();
    const result = await resetPassword(fd);
    expect(result).toEqual({ success: false, error: "Passwort ist erforderlich" });
  });

  it("sollte Fehler bei nicht übereinstimmenden Passwörtern zurückgeben", async () => {
    const fd = new FormData();
    fd.set("password", "geheim123");
    fd.set("confirmPassword", "anders456");
    const result = await resetPassword(fd);
    expect(result).toEqual({ success: false, error: "Passwörter stimmen nicht überein" });
  });

  it("sollte Fehler bei zu kurzem Passwort zurückgeben", async () => {
    const fd = new FormData();
    fd.set("password", "kurz");
    fd.set("confirmPassword", "kurz");
    const result = await resetPassword(fd);
    expect(result).toEqual({ success: false, error: "Passwort muss mindestens 8 Zeichen haben" });
  });

  it("sollte erfolgreiches Zurücksetzen melden", async () => {
    mockInsforgeClient.auth.resetPassword = vi.fn(() =>
      Promise.resolve({ data: {}, error: null })
    );

    const fd = new FormData();
    fd.set("password", "neuespasswort123");
    fd.set("confirmPassword", "neuespasswort123");
    fd.set("token", "reset-token");
    const result = await resetPassword(fd);
    expect(result).toEqual({ success: true });
  });

  it("sollte Fehler vom Auth-Provider weitergeben", async () => {
    mockInsforgeClient.auth.resetPassword = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: "Invalid or expired token" } })
    );

    const fd = new FormData();
    fd.set("password", "neuespasswort123");
    fd.set("confirmPassword", "neuespasswort123");
    const result = await resetPassword(fd);
    expect(result).toEqual({ success: false, error: "Invalid or expired token" });
  });
});
