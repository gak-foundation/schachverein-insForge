export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');
export const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');
