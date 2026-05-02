import { createServerClient as createIfServerClient, createServiceClient as createIfServiceClient, database } from '@/lib/insforge';

export function createClient() {
  const client = createIfServerClient();
  return {
    ...client,
    database,
    auth: client.auth,
  };
}

export function createServerClient() {
  const client = createIfServerClient();
  return {
    ...client,
    database,
    auth: client.auth,
  };
}

export function createServiceClient() {
  const client = createIfServiceClient();
  return {
    ...client,
    database,
    auth: client.auth,
  };
}

export { database, createServerClient as createIfServerClient };

export * from '@/lib/insforge';