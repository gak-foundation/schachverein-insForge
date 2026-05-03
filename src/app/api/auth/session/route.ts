import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { insforge } from '@/lib/insforge';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('insforge_session')?.value;
  
  if (!token) {
    return NextResponse.json({ user: null });
  }
  
  try {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data.user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: data.user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
