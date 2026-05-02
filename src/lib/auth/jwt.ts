import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 week from now')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get('insforge_session')?.value;
}

export async function setSessionToken(user: any) {
  const token = await encrypt({ user });
  const cookieStore = await cookies();
  cookieStore.set('insforge_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearSessionToken() {
  const cookieStore = await cookies();
  cookieStore.delete('insforge_session');
}
