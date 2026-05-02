import { createClient as createInsForgeClient } from '@insforge/sdk';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? 'https://4d3rbpyx.eu-central.insforge.app';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.INSFORGE_SERVICE_ROLE_KEY;

function getAnonKey(): string | undefined {
  if (typeof window !== 'undefined') {
    return INSFORGE_ANON_KEY;
  }
  return INSFORGE_ANON_KEY;
}

export const insforge = createInsForgeClient({
  baseUrl: INSFORGE_URL,
  anonKey: getAnonKey(),
  serviceRoleKey: SERVICE_ROLE_KEY,
});

export const auth = insforge.auth;

export function databaseFrom(table: string) {
  return {
    select: (columns?: string, options?: any) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          const { data, error } = await insforge.database
            .from(table)
            .select(columns || '*', options)
            .eq(column, value);
          return { data: data?.[0] || null, error };
        },
        maybeSingle: async () => {
          const { data, error } = await insforge.database
            .from(table)
            .select(columns || '*', options)
            .eq(column, value);
          return { data: data?.[0] || null, error };
        },
        limit: async (count: number) => {
          const { data, error } = await insforge.database
            .from(table)
            .select(columns || '*', options)
            .eq(column, value)
            .limit(count);
          return { data, error };
        },
        order: (column: string, opts?: any) => ({
          range: async (from: number, to: number) => {
            const { data, error } = await insforge.database
              .from(table)
              .select(columns || '*', options)
              .eq(column, value)
              .order(column, opts)
              .range(from, to);
            return { data, error };
          },
        }),
      }),
      ilike: (column: string, pattern: string) => ({
        limit: async (count: number) => {
          const { data, error } = await insforge.database
            .from(table)
            .select(columns || '*', options)
            .ilike(column, pattern)
            .limit(count);
          return { data, error };
        },
      }),
      in: (column: string, values: any[]) => ({
        limit: async (count: number) => {
          const { data, error } = await insforge.database
            .from(table)
            .select(columns || '*', options)
            .in(column, values)
            .limit(count);
          return { data, error };
        },
      }),
      is: (column: string, value: any) => ({
        limit: async (count: number) => {
          const { data, error } = await insforge.database
            .from(table)
            .select(columns || '*', options)
            .is(column, value)
            .limit(count);
          return { data, error };
        },
      }),
      order: (column: string, opts?: any) => ({
        limit: async (count: number) => {
          const { data, error } = await insforge.database
            .from(table)
            .select(columns || '*', options)
            .order(column, opts)
            .limit(count);
          return { data, error };
        },
      }),
      limit: async (count: number) => {
        const { data, error } = await insforge.database
          .from(table)
          .select(columns || '*', options)
          .limit(count);
        return { data, error };
      },
      range: async (from: number, to: number) => {
        const { data, error } = await insforge.database
          .from(table)
          .select(columns || '*', options)
          .range(from, to);
        return { data, error };
      },
    }),
    insert: async (values: any) => {
      const { data, error } = await insforge.database
        .from(table)
        .insert(values);
      return { data, error };
    },
    update: (values: any) => ({
      eq: async (column: string, value: any) => {
        const { data, error } = await insforge.database
          .from(table)
          .update(values)
          .eq(column, value);
        return { data, error };
      },
    }),
    delete: () => ({
      eq: async (column: string, value: any) => {
        const { error } = await insforge.database
          .from(table)
          .delete()
          .eq(column, value);
        return { error };
      },
    }),
  };
}

export const database = {
  from: databaseFrom,
};

export function createServerClient() {
  const client = createInsForgeClient({
    baseUrl: INSFORGE_URL,
    anonKey: getAnonKey() ?? '',
  });
  return {
    ...client,
    database,
    auth: client.auth,
  };
}

export function createServiceClient() {
  const client = createInsForgeClient({
    baseUrl: INSFORGE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
  return {
    ...client,
    database,
    auth: client.auth,
  };
}

export { INSFORGE_URL };