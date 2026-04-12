import { createAuthClient } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    twoFactorClient(),
  ],
});

export const { 
  signIn, 
  signOut, 
  signUp, 
  useSession, 
  twoFactor: {
    enable: enableTwoFactor,
    disable: disableTwoFactor,
    verifyTotp: verifyTwoFactor,
  },
} = authClient;

export type Session = typeof authClient.$Infer.Session;
