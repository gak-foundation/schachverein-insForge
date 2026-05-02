import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge/client';

export async function POST(request: Request) {
  try {
    const { email, password, options } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name: options?.data?.name || email.split('@')[0],
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
