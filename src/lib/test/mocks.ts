import { vi } from "vitest";

/**
 * Erstellt einen chainable Mock für Drizzle ORM Queries.
 * Unterstützt: select().from().where().orderBy().limit().offset()
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
    // Exposed für manuelles Mocking
    _from: fromMock,
    _insertValues: insertValuesMock,
    _insertReturning: insertReturningMock,
    _returning: returningMock,
    _updateSet: updateSetMock,
    _updateWhere: updateWhereMock,
    _deleteWhere: deleteWhereMock,
  };
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
