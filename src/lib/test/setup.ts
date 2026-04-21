import { vi } from "vitest";
import { createDbMock, createQueryMock } from "./mocks";

const dbMock = createDbMock();
const queryMock = createQueryMock();

vi.mock("@/lib/db", () => ({
  db: {
    ...dbMock,
    query: queryMock,
  },
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

export { dbMock, queryMock };
