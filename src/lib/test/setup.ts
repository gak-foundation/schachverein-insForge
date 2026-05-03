import { vi } from "vitest";
import { createMockInsForgeClient } from "./mocks";

const insforgeClient = createMockInsForgeClient();

vi.mock("@/lib/insforge", () => ({
  createClient: vi.fn(() => insforgeClient),
  createServerClient: vi.fn(() => insforgeClient),
  createServiceClient: vi.fn(() => insforgeClient),
  INSFORGE_URL: "https://test.insforge.dev",
  insforge: insforgeClient,
  auth: insforgeClient.auth,
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getSession: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("@/lib/audit", () => ({
  logMemberAction: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/crypto", () => ({
  encrypt: vi.fn((v: string) => `encrypted:${v}`),
  decrypt: vi.fn((v: string) => v.replace("encrypted:", "")),
}));

export { insforgeClient };
