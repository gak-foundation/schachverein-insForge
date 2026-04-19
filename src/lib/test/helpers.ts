import { vi } from "vitest";

/**
 * Erstellt ein Mock FormData Objekt aus einem Record
 */
export function mockFormData(data: Record<string, string | File | null | undefined>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  }
  return formData;
}

/**
 * Erstellt einen chainable Mock für Drizzle ORM Queries
 */
export function createChainableMock(returnValue: unknown = []) {
  const chainable = {
    where: vi.fn(() => chainable),
    andWhere: vi.fn(() => chainable),
    orWhere: vi.fn(() => chainable),
    orderBy: vi.fn(() => chainable),
    limit: vi.fn(() => chainable),
    offset: vi.fn(() => chainable),
    innerJoin: vi.fn(() => chainable),
    leftJoin: vi.fn(() => chainable),
    rightJoin: vi.fn(() => chainable),
    fullJoin: vi.fn(() => chainable),
    groupBy: vi.fn(() => chainable),
    having: vi.fn(() => chainable),
    then: vi.fn((callback: (value: unknown) => unknown) => Promise.resolve(callback(returnValue))),
  };
  return chainable;
}

/**
 * Erstellt einen vollständigen DB Select Mock
 */
export function mockDbSelect(returnValue: unknown = []) {
  return {
    from: vi.fn(() => createChainableMock(returnValue)),
  };
}

/**
 * Erstellt einen DB Insert Mock mit optionaler Rückgabe
 */
export function mockDbInsert(returnValue: unknown = [{ id: "test-id" }]) {
  return {
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve(returnValue)),
    })),
  };
}

/**
 * Erstellt einen DB Insert Mock ohne returning
 */
export function mockDbInsertSimple() {
  return {
    values: vi.fn(() => Promise.resolve()),
  };
}

/**
 * Erstellt einen DB Update Mock
 */
export function mockDbUpdate() {
  return {
    set: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  };
}

/**
 * Erstellt einen DB Delete Mock
 */
export function mockDbDelete() {
  return {
    where: vi.fn(() => Promise.resolve()),
  };
}

/**
 * Erstellt einen vollständigen DB Mock
 */
export function createFullDbMock(options: {
  selectReturn?: unknown;
  insertReturn?: unknown;
} = {}) {
  return {
    select: vi.fn(() => mockDbSelect(options.selectReturn)),
    insert: vi.fn(() => mockDbInsert(options.insertReturn)),
    update: vi.fn(() => mockDbUpdate()),
    delete: vi.fn(() => mockDbDelete()),
  };
}

/**
 * Mock für requireClubId Helper
 */
export function mockRequireClubId(clubId: string = "club-1") {
  return vi.fn(() => Promise.resolve(clubId));
}

/**
 * Mock für getSession Helper  
 */
export function mockGetSession(session: { user: { id: string; role?: string } } | null = null) {
  return vi.fn(() => Promise.resolve(session ?? { user: { id: "user-1", role: "admin" } }));
}
