import { Suspense } from "react";
import LoginPageContent from "@/features/auth/components/login-page-content";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { AuthCard } from "@/features/auth/components/auth-card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ invitation?: string; redirect?: string }>;
}) {
  const { invitation, redirect } = await searchParams;
  const invitationToken = invitation ?? null;
  const redirectPath = redirect ?? "/dashboard";

  return (
    <Suspense
      fallback={
        <AuthLayout>
          <AuthCard>
            <div className="space-y-6 animate-pulse">
              <div className="h-8 w-48 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-11 w-full rounded bg-muted" />
              <div className="h-11 w-full rounded bg-muted" />
            </div>
          </AuthCard>
        </AuthLayout>
      }
    >
      <LoginPageContent
        invitationToken={invitationToken}
        redirectPath={redirectPath}
      />
    </Suspense>
  );
}