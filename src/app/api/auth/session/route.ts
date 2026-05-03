import { NextResponse } from 'next/server';
import { createServerAuthClient } from '@/lib/insforge/server-auth';

export async function GET() {
  try {
    const client = await createServerAuthClient();
    const { data, error } = await client.auth.getCurrentUser();
    if (error || !data?.user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: data.user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
