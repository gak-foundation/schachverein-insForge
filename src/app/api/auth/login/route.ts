import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge/client';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data?.user) {
      return NextResponse.json({ error: 'Login failed' }, { status: 401 });
    }

    return NextResponse.json({ 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.profile?.name,
        role: 'user',
        user_metadata: data.user.profile,
      },
      accessToken: data.accessToken,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
