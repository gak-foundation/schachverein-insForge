import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/insforge';
import { clearAuthCookies } from '@/lib/insforge/server-auth';

export async function POST() {
  try {
    const client = createServerClient();
    await client.auth.signOut();
  } catch {
    // Ignore SDK signOut errors
  }

  await clearAuthCookies();

  return NextResponse.json({ success: true });
}
