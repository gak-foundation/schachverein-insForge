import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { ensureAuthUser } from '@/lib/db/queries/auth';

export async function POST(request: Request) {
  try {
    const { email, password, options } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const name = options?.data?.name || email.split('@')[0];

    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Sync user to public.auth_user (replaces DB trigger)
    if (data?.user) {
      await ensureAuthUser({
        id: data.user.id,
        email: data.user.email,
        name,
        emailVerified: data.user.emailVerified ?? false,
      });
    }

    if (data?.requireEmailVerification) {
      return NextResponse.json({ 
        message: 'Please verify your email',
        requireEmailVerification: true,
      });
    }

    return NextResponse.json({ 
      user: data?.user,
      accessToken: data?.accessToken,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
