import { vi } from "vitest";

/**
 * Erstellt einen chainable Mock für Drizzle ORM Queries.
 */
export function createDbMock() {
  const createChainable = (returnValue: unknown = []) => {
    const chainable = {
      where: vi.fn(() => chainable),
      orderBy: vi.fn(() => chainable),
      limit: vi.fn(() => chainable),
      offset: vi.fn(() => chainable),
      innerJoin: vi.fn(() => chainable),
      leftJoin: vi.fn(() => chainable),
      then: vi.fn((callback: (value: unknown) => unknown) => Promise.resolve(callback(returnValue))),
    };
    return chainable;
  };

  const fromMock = vi.fn(() => createChainable());
  const selectMock = vi.fn(() => ({ from: fromMock }));

  const insertValuesMock = vi.fn(() => Promise.resolve([{ id: "test-id" }]));
  const insertMock = vi.fn(() => ({ values: insertValuesMock }));

  const updateWhereMock = vi.fn(() => Promise.resolve());
  const updateSetMock = vi.fn(() => ({ where: updateWhereMock }));
  const updateMock = vi.fn(() => ({ set: updateSetMock }));

  const deleteWhereMock = vi.fn(() => Promise.resolve());
  const deleteMock = vi.fn(() => ({ where: deleteWhereMock }));

  const returningMock = vi.fn(() => Promise.resolve([{ id: "test-id" }]));
  const insertReturningMock = vi.fn(() => ({ returning: returningMock }));
  const insertMockWithReturning = vi.fn(() => ({ values: insertReturningMock }));

  return {
    select: selectMock,
    insert: insertMock,
    insertWithReturning: insertMockWithReturning,
    update: updateMock,
    delete: deleteMock,
    _from: fromMock,
    _insertValues: insertValuesMock,
    _insertReturning: insertReturningMock,
    _returning: returningMock,
    _updateSet: updateSetMock,
    _updateWhere: updateWhereMock,
    _deleteWhere: deleteWhereMock,
  };
}

// ===== InsForge Client Mock =====

interface InsForgeResult<T = unknown> {
  data: T | null;
  error: Record<string, unknown> | null;
  count?: number | null;
}

function createInsForgeThenable<T = unknown>(result: InsForgeResult<T>) {
  const thenFn = <R>(resolve: (value: InsForgeResult<T>) => R | PromiseLike<R>) => Promise.resolve(result).then(resolve);
  return { then: thenFn, catch: (fn: (e: unknown) => unknown) => Promise.resolve(result).catch(fn) };
}

export type MockInsForgeQueryChain = Record<string, unknown> & { then: typeof Promise.prototype.then };

function createChain(returnData: unknown = [], returnCount?: number): MockInsForgeQueryChain {
  const result: InsForgeResult = {
    data: returnData,
    error: null,
    count: returnCount ?? null,
  };

  const thenable = createInsForgeThenable(result);

  const chain: Record<string, unknown> = {
    eq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    not: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    like: vi.fn(() => chain),
    ilike: vi.fn(() => chain),
    is: vi.fn(() => chain),
    in: vi.fn(() => chain),
    contains: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    offset: vi.fn(() => chain),
    range: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(() => createInsForgeThenable({ data: Array.isArray(returnData) ? returnData[0] ?? null : returnData, error: null })),
    maybeSingle: vi.fn(() => createInsForgeThenable({ data: Array.isArray(returnData) ? returnData[0] ?? null : returnData, error: null })),
    insert: vi.fn(() => createInsForgeThenable({ data: null, error: null })),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    then: thenable.then,
  };

  return chain as MockInsForgeQueryChain;
}

export interface MockInsForgeClient {
  from: ReturnType<typeof vi.fn>;
  auth: { signUp: ReturnType<typeof vi.fn>; signIn: ReturnType<typeof vi.fn>; signOut: ReturnType<typeof vi.fn>; refreshSession: ReturnType<typeof vi.fn> };
  database: { from: ReturnType<typeof vi.fn> };
  _tableMocks: Map<string, MockInsForgeQueryChain>;
}

function createChainWithDefaults() {
  return createChain([]);
}

/**
 * Erstellt einen vollständigen Mock für den InsForge Client.
 * Jeder `.from("table")`-Aufruf erzeugt einen neuen chainable Query-Builder.
 * Tabelle-spezifische Rückgabedaten können via `_tableMocks` konfiguriert werden.
 */
export function createMockInsForgeClient(): MockInsForgeClient {
  const tableMocks = new Map<string, MockInsForgeQueryChain>();
  let currentTable: string | null = null;

  const fromMock = vi.fn((table: string) => {
    currentTable = table;
    let chain = tableMocks.get(table);
    if (!chain) {
      chain = createChainWithDefaults();
      tableMocks.set(table, chain);
    }
    return chain;
  });

  const client = {
    from: fromMock,
    auth: {
      signUp: vi.fn(() => Promise.resolve({ data: { user: { id: "user-1" }, session: null }, error: null })),
      signIn: vi.fn(() => Promise.resolve({ data: { user: { id: "user-1" }, session: { access_token: "test-token" } }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      refreshSession: vi.fn(() => Promise.resolve({ data: { accessToken: "refreshed-token" }, error: null })),
    },
    database: { from: fromMock },
    _tableMocks: tableMocks,
  };

  return client;
}

/**
 * Konfiguriert einen Mock für eine bestimmte Tabelle im InsForge Client.
 */
export function mockInsForgeTable(
  mockClient: MockInsForgeClient,
  table: string,
  returnData: unknown = [],
  returnCount?: number,
): MockInsForgeQueryChain {
  const chain = createChain(returnData, returnCount);
  mockClient._tableMocks.set(table, chain);
  return chain;
}

/**
 * Erstellt einen Error-Mock für eine Tabelle.
 */
export function mockInsForgeTableError(
  mockClient: MockInsForgeClient,
  table: string,
  errorMessage = "Mock error",
): MockInsForgeQueryChain {
  const error = { message: errorMessage, code: "MOCK_ERROR" };
  const thenable = createInsForgeThenable({ data: null, error });

  const chain: Record<string, unknown> = {
    eq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    not: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    like: vi.fn(() => chain),
    ilike: vi.fn(() => chain),
    is: vi.fn(() => chain),
    in: vi.fn(() => chain),
    contains: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    offset: vi.fn(() => chain),
    range: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(() => createInsForgeThenable({ data: null, error })),
    maybeSingle: vi.fn(() => createInsForgeThenable({ data: null, error })),
    insert: vi.fn(() => createInsForgeThenable({ data: null, error })),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    then: thenable.then,
  };

  mockClient._tableMocks.set(table, chain as unknown as MockInsForgeQueryChain);
  return chain as unknown as MockInsForgeQueryChain;
}

/**
 * Erstellt einen mock für db.query (für relation queries)
 */
export function createQueryMock() {
  return {
    tournaments: {
      findMany: vi.fn(() => Promise.resolve([])),
      findFirst: vi.fn(() => Promise.resolve(null)),
    },
    members: {
      findMany: vi.fn(() => Promise.resolve([])),
      findFirst: vi.fn(() => Promise.resolve(null)),
    },
    teams: {
      findMany: vi.fn(() => Promise.resolve([])),
      findFirst: vi.fn(() => Promise.resolve(null)),
    },
    events: {
      findMany: vi.fn(() => Promise.resolve([])),
      findFirst: vi.fn(() => Promise.resolve(null)),
    },
    games: {
      findMany: vi.fn(() => Promise.resolve([])),
      findFirst: vi.fn(() => Promise.resolve(null)),
    },
    tournamentParticipants: {
      findMany: vi.fn(() => Promise.resolve([])),
      findFirst: vi.fn(() => Promise.resolve(null)),
    },
    payments: {
      findMany: vi.fn(() => Promise.resolve([])),
      findFirst: vi.fn(() => Promise.resolve(null)),
    },
    seasons: {
      findMany: vi.fn(() => Promise.resolve([])),
      findFirst: vi.fn(() => Promise.resolve(null)),
    },
    clubMemberships: {
      findMany: vi.fn(() => Promise.resolve([])),
      findFirst: vi.fn(() => Promise.resolve(null)),
    },
    contributionRates: {
      findMany: vi.fn(() => Promise.resolve([])),
      findFirst: vi.fn(() => Promise.resolve(null)),
    },
  };
}

/**
 * Hilfsfunktion zum Erstellen einer resolved Chain für select queries
 */
export function createSelectChain(returnValue: unknown = []) {
  const chain = {
    where: vi.fn(() => chain),
    orderBy: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    offset: vi.fn(() => chain),
    innerJoin: vi.fn(() => chain),
    leftJoin: vi.fn(() => chain),
  };
  
  // @ts-expect-error - thenable for async/await
  chain.then = vi.fn((callback: (value: unknown) => unknown) => Promise.resolve(callback(returnValue)));
  
  return {
    from: vi.fn(() => chain),
  };
}

/**
 * Hilfsfunktion zum Erstellen einer resolved Chain für insert with returning
 */
export function createInsertReturningChain(returnValue: unknown = [{ id: "test-id" }]) {
  return {
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve(returnValue)),
    })),
  };
}

/**
 * Hilfsfunktion zum Erstellen einer resolved Chain für update
 */
export function createUpdateChain() {
  return {
    set: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  };
}

/**
 * Hilfsfunktion zum Erstellen einer resolved Chain für delete
 */
export function createDeleteChain() {
  return {
    where: vi.fn(() => Promise.resolve()),
  };
}
